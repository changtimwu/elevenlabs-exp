"""Generate Realtime Mini / Max variants of each base agent config.

The base configs in agent_configs/ are the single source of truth. Each variant
is an identical copy with conversation_config.realtime_model set, because the
Realtime model can't be overridden per conversation — it has to be a separate
agent. After editing a base config:

    python3 scripts/realtime_variants.py && elevenlabs agents push
"""
import copy
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BASES = ["Mandarin-Customer-Service", "Health-Alert"]
VARIANTS = {
    "realtime-mini": ("eleven_realtime_v1_mini", "Realtime Mini"),
    "realtime-max": ("eleven_realtime_v1_max", "Realtime Max"),
}

for base in BASES:
    config = json.loads((ROOT / "agent_configs" / f"{base}.json").read_text())
    for suffix, (model, label) in VARIANTS.items():
        variant = copy.deepcopy(config)
        variant["name"] = f"{config['name']} ({label})"
        variant["conversation_config"]["realtime_model"] = model
        variant["tags"] = sorted(set(variant.get("tags", [])) | {"realtime"})
        out = ROOT / "agent_configs" / f"{base}.{suffix}.json"
        out.write_text(json.dumps(variant, ensure_ascii=False, indent=4))
        print(f"wrote {out.relative_to(ROOT)}")
