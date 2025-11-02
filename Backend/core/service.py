from core.schemas import RequestModel, Result, Evidence
from integrations.adk_client_gcp import call_adk

def verify(req: RequestModel) -> Result:
    adk_response = call_adk(req.text, {"channel": req.channel, "user": req.user})
    evidence = [Evidence(**e) for e in adk_response.get("evidence", [])[:3]]
    return Result(
        status="ok",
        verdict=adk_response.get("verdict", "unverified"),
        confidence=float(adk_response.get("confidence", 0.5)),
        evidence=evidence,
        raw_final=adk_response.get("raw_final"),  # pass-through
    )


