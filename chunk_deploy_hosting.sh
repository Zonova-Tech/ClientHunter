#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

npm run build >/dev/null

cat > firebase.chunk.json <<'JSON'
{
  "hosting": {
    "public": ".deploy-staging",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
JSON

mapfile -t FILES < <(find dist/sample-images/samples -maxdepth 1 -type f | sort)
TOTAL=${#FILES[@]}
CHUNK_SIZE=2

if [[ "$TOTAL" -eq 0 ]]; then
  echo "No sample images found in dist/sample-images/samples"
  exit 0
fi

echo "Deploying $TOTAL files in cumulative chunks of $CHUNK_SIZE"

index=0
while [[ $index -lt $TOTAL ]]; do
  end=$((index + CHUNK_SIZE))
  if [[ $end -gt $TOTAL ]]; then
    end=$TOTAL
  fi

  rm -rf .deploy-staging
  mkdir -p .deploy-staging/sample-images/samples

  # Base app files (without sample images)
  rsync -a --exclude 'sample-images/' dist/ .deploy-staging/

  # Add cumulative sample image set up to current chunk end
  i=0
  while [[ $i -lt $end ]]; do
    cp "${FILES[$i]}" .deploy-staging/sample-images/samples/
    i=$((i + 1))
  done

  echo "Deploy chunk: 1..$end / $TOTAL"

  attempt=1
  until firebase deploy --only hosting --config firebase.chunk.json; do
    if [[ $attempt -ge 5 ]]; then
      echo "Failed permanently at chunk ending $end"
      exit 1
    fi
    attempt=$((attempt + 1))
    echo "Retrying chunk 1..$end (attempt $attempt/5)"
    sleep 4
  done

  index=$end
done

echo "Chunked deploy complete."
