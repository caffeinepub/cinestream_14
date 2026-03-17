import Blob "mo:core/Blob";
import Text "mo:core/Text";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Debug "mo:core/Debug";
import IC "ic:aaaaa-aa";

module {
  public func transform(input : TransformationInput) : TransformationOutput {
    let response = input.response;
    {
      response with headers = [];
    };
  };

  public type TransformationInput = {
    context : Blob;
    response : IC.http_request_result;
  };
  public type TransformationOutput = IC.http_request_result;
  public type Transform = query TransformationInput -> async TransformationOutput;
  public type Header = {
    name : Text;
    value : Text;
  };

  // 230B cycles covers the base fee + per-byte costs for a 5MB response
  let httpRequestCycles = 230_000_000_000;

  public func httpGetRequest(url : Text, extraHeaders : [Header], transform : Transform) : async Text {
    Debug.print("[OutCall] GET " # url);

    let headers = extraHeaders.concat([
      { name = "User-Agent"; value = "CineStream" },
      { name = "Accept";     value = "application/json" },
    ]);

    let http_request : IC.http_request_args = {
      url;
      max_response_bytes = ?5_000_000;  // 5 MB cap prevents truncation
      headers;
      body = null;
      method = #get;
      transform = ?{
        function = transform;
        context = Blob.fromArray([]);
      };
      is_replicated = ?false;
    };

    let httpResponse = await (with cycles = httpRequestCycles) IC.http_request(http_request);

    // Safe decode: return "{}" instead of trapping so callers can handle gracefully
    switch (httpResponse.body.decodeUtf8()) {
      case (null) {
        Debug.print("[OutCall] UTF-8 decode failed for " # url);
        "{}";
      };
      case (?body) {
        Debug.print("[OutCall] response received for " # url);
        if (body == "") { "{}" } else { body };
      };
    };
  };

  public func httpPostRequest(url : Text, extraHeaders : [Header], body : Text, transform : Transform) : async Text {
    let headers = extraHeaders.concat([
      { name = "User-Agent";      value = "CineStream" },
      { name = "Idempotency-Key"; value = "Time-" # Time.now().toText() },
    ]);
    let requestBody = body.encodeUtf8();
    let httpRequest : IC.http_request_args = {
      url;
      max_response_bytes = ?5_000_000;
      headers;
      body = ?requestBody;
      method = #post;
      transform = ?{
        function = transform;
        context = Blob.fromArray([]);
      };
      is_replicated = ?false;
    };
    let httpResponse = await (with cycles = httpRequestCycles) IC.http_request(httpRequest);
    switch (httpResponse.body.decodeUtf8()) {
      case (null) {
        Debug.print("[OutCall] POST UTF-8 decode failed for " # url);
        "{}";
      };
      case (?decodedResponse) { decodedResponse };
    };
  };
};
