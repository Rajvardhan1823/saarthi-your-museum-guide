# Rime Voice Evidence

## Hard voice claim

Saarthi is a QR-per-exhibit museum voice agent. Its prototype claim is that
Rime's Coda model can produce intelligible, correctly pronounced English
responses for Indian proper nouns such as Chola, Pallava, Vijayanagara,
Hoysala, Chalukya, Nataraja, Ardhanarishvara, and Sembiyan Mahadevi.

This matters because museum content contains names that generic speech systems
may mispronounce. A pronunciation failure can reduce visitor trust in the
guide. This evidence track tests pronunciation and controlled English
delivery only; multilingual support is outside the prototype scope.

The pilot corpus is based on the Bronze Gallery of the Government Museum,
Chennai (Egmore), including Chola-period bronzes and Nataraja and
Ardhanarishvara references.

## Acceptance test

- **Model ID:** `coda`
- **Language:** `en`
- **Speaker:** record the selected Coda English speaker in the results
- **Corpus:** 10 sentences below, each containing at least one Indian proper
  noun
- **Proper-noun intelligibility:** pass/fail, scored after one listen without
  reading along
- **Naturalness:** listener score from 1 (poor) to 5 (natural)
- **Pass bar:** at least 8 of 10 clips pass proper-noun intelligibility

The pass bar must be calculated from recorded listener results. No illustrative
or placeholder score is a product result.

## Test corpus

1. Tell me about the Chola bronze of Ardhanarishvara.
2. When was the Nataraja sculpture cast using the lost-wax method?
3. What's the difference between Pallava and Chola era bronzes?
4. Who was Queen Sembiyan Mahadevi?
5. Where is the Government Museum located in Egmore?
6. Explain the significance of Shiva as Nataraja, the cosmic dancer.
7. How old are the Vijayanagara and Hoysala sculptures here?
8. What does Ardhanarishvara symbolize in Hindu iconography?
9. Is this Chalukya period or Chola period craftsmanship?
10. Tell me about the bronze gallery's oldest Pallava sculpture.

## Procedure

1. Set `RIME_API_KEY` and choose an English Coda speaker in
   `RIME_ENGLISH_SPEAKER`.
2. Run the repeatable script below.
3. Save one clip per sentence under `evidence/clips/`.
4. Listen once to each clip and record intelligibility and naturalness in
   `evidence/results.csv`.
5. Re-render a failing sentence once with a reworded or respelled proper noun.
   Keep both clips and record the change.
6. Report the measured pass rate and average naturalness below.

## Result

Complete this section only after running the test and listening to every clip.

| Sentence | Proper noun(s) | Pass/fail | Naturalness (1–5) | Notes |
| --- | --- | --- | --- | --- |
| 1 | Chola, Ardhanarishvara | — | — | Not measured |
| 2 | Nataraja | — | — | Not measured |
| 3 | Pallava, Chola | — | — | Not measured |
| 4 | Sembiyan Mahadevi | — | — | Not measured |
| 5 | Egmore | — | — | Not measured |
| 6 | Nataraja | — | — | Not measured |
| 7 | Vijayanagara, Hoysala | — | — | Not measured |
| 8 | Ardhanarishvara | — | — | Not measured |
| 9 | Chalukya, Chola | — | — | Not measured |
| 10 | Pallava | — | — | Not measured |

**Measured summary:** pending execution of the repeatable test.

## Exact production integration

The application currently uses:

- **Model ID:** `coda`
- **Speaker:** `RIME_ENGLISH_SPEAKER`, falling back to `astra`
- **Language:** `en`
- **Endpoint:** `https://users.rime.ai/v1/rime-tts`
- **Transport:** server-side HTTPS `POST`
- **Request:** JSON containing `text`, `modelId`, `speaker`, and `lang`
- **Audio format:** WAV (`Accept: audio/wav`)
- **Response:** raw audio bytes converted to a browser data URL

## Limitations

- This is a 10-sentence exploratory test, not a comprehensive pronunciation
  benchmark.
- A single-listener score is not statistically robust.
- Results apply to the tested exhibit vocabulary and selected speaker only.
- Coda does not provide the inline curly-bracket phonetic overrides available
  in some Mist integrations. Rewording or respelling is the practical
  correction path for this prototype.
- Multilingual support is explicitly out of scope; the prototype is English
  only.
- Provider availability, quota, network latency, and browser playback can
  affect the live demo independently of pronunciation quality.

## Repeatable render script

Save as `render_rime_evidence.sh`, make it executable, and run:

```bash
RIME_API_KEY=your_key RIME_ENGLISH_SPEAKER=astra ./render_rime_evidence.sh
```

Do not commit API keys or generated audio containing private material.

```bash
#!/usr/bin/env bash
set -euo pipefail

: "${RIME_API_KEY:?Set RIME_API_KEY}"
: "${RIME_ENGLISH_SPEAKER:?Set RIME_ENGLISH_SPEAKER}"

mkdir -p evidence/clips

sentences=(
  "Tell me about the Chola bronze of Ardhanarishvara."
  "When was the Nataraja sculpture cast using the lost-wax method?"
  "What's the difference between Pallava and Chola era bronzes?"
  "Who was Queen Sembiyan Mahadevi?"
  "Where is the Government Museum located in Egmore?"
  "Explain the significance of Shiva as Nataraja, the cosmic dancer."
  "How old are the Vijayanagara and Hoysala sculptures here?"
  "What does Ardhanarishvara symbolize in Hindu iconography?"
  "Is this Chalukya period or Chola period craftsmanship?"
  "Tell me about the bronze gallery's oldest Pallava sculpture."
)

for i in "${!sentences[@]}"; do
  n=$(printf "%02d" "$((i + 1))")
  payload=$(printf '%s' "${sentences[$i]}" | node -e '
    let data = "";
    process.stdin.on("data", chunk => data += chunk);
    process.stdin.on("end", () => process.stdout.write(JSON.stringify({
      text: data,
      modelId: "coda",
      speaker: process.env.RIME_ENGLISH_SPEAKER,
      lang: "en"
    })));
  ')
  curl --fail --silent --show-error --request POST \
    --url https://users.rime.ai/v1/rime-tts \
    --header "Authorization: Bearer ${RIME_API_KEY}" \
    --header "Content-Type: application/json" \
    --header "Accept: audio/wav" \
    --data "$payload" \
    --output "evidence/clips/en_${n}.wav"
  echo "Rendered evidence/clips/en_${n}.wav"
done
```

## Results CSV template

```csv
sentence_number,proper_noun,pass_fail,naturalness_1to5,notes
01,"Chola,Ardhanarishvara",,,
02,Nataraja,,,
03,"Pallava,Chola",,,
04,Sembiyan Mahadevi,,,
05,Egmore,,,
06,Nataraja,,,
07,"Vijayanagara,Hoysala",,,
08,Ardhanarishvara,,,
09,"Chalukya,Chola",,,
10,Pallava,,,
```
