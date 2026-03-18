// Supabase Edge Function: 阿里云短信发送（SMS Hook）
// 支持 Supabase Auth SMS Hook 格式

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function hmacSha1Base64(key: string, message: string): string {
  // 使用 Web Crypto API（Deno 原生支持）
  const encoder = new TextEncoder();
  const keyData = encoder.encode(key);
  const messageData = encoder.encode(message);
  
  // 简化实现：使用 SubtleCrypto
  return btoa(String.fromCharCode(...new Uint8Array(
    // 这里用同步方式模拟，实际需要异步
    messageData
  )));
}

async function signAliyun(method: string, params: Record<string, string>, secret: string): Promise<string> {
  const sorted = Object.keys(params).sort().map(k =>
    `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`
  ).join("&");
  const stringToSign = `${method}&${encodeURIComponent("/")}&${encodeURIComponent(sorted)}`;
  
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret + "&");
  const messageData = encoder.encode(stringToSign);
  
  const cryptoKey = await crypto.subtle.importKey(
    "raw", keyData, { name: "HMAC", hash: "SHA-1" }, false, ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, messageData);
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    console.log("SMS Hook payload:", JSON.stringify(payload));

    // Supabase SMS Hook 格式: { user: { phone: "+8613800138000" }, sms: { otp: "123456" } }
    const phone: string = payload.user?.phone || payload.phone || "";
    const otp: string = payload.sms?.otp || payload.otp || "";

    if (!phone || !otp) {
      return new Response(JSON.stringify({ error: "Missing phone or otp" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // 去掉 +86 前缀，只保留手机号
    const phoneNumber = phone.replace(/^\+86/, "").replace(/\D/g, "");

    const accessKeyId = Deno.env.get("ALIYUN_ACCESS_KEY_ID") || "";
    const accessKeySecret = Deno.env.get("ALIYUN_ACCESS_KEY_SECRET") || "";
    const signName = Deno.env.get("ALIYUN_SMS_SIGN_NAME") || "猫眼VIP";
    const templateCode = Deno.env.get("ALIYUN_SMS_TEMPLATE_CODE") || "SMS_332975393";

    if (!accessKeyId || !accessKeySecret) {
      console.error("Missing Aliyun credentials");
      return new Response(JSON.stringify({ error: "SMS service not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
    const nonce = crypto.randomUUID().replace(/-/g, "");

    const params: Record<string, string> = {
      AccessKeyId: accessKeyId,
      Action: "SendSms",
      Format: "JSON",
      PhoneNumbers: phoneNumber,
      RegionId: "cn-hangzhou",
      SignName: signName,
      SignatureMethod: "HMAC-SHA1",
      SignatureNonce: nonce,
      SignatureVersion: "1.0",
      TemplateCode: templateCode,
      TemplateParam: JSON.stringify({ code: otp }),
      Timestamp: timestamp,
      Version: "2017-05-25",
    };

    const signature = await signAliyun("GET", params, accessKeySecret);
    params.Signature = signature;

    const queryString = Object.keys(params).sort()
      .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
      .join("&");

    const url = `https://dysmsapi.aliyuncs.com/?${queryString}`;
    console.log("Calling Aliyun SMS API for phone:", phoneNumber);
    
    const response = await fetch(url);
    const result = await response.json();
    console.log("Aliyun SMS response:", JSON.stringify(result));

    if (result.Code === "OK") {
      return new Response(JSON.stringify({ success: true, requestId: result.RequestId }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    } else {
      console.error("Aliyun SMS error:", result.Code, result.Message);
      return new Response(JSON.stringify({ error: result.Message, code: result.Code }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
