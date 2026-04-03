#!/bin/bash
cd "$(dirname "$0")"
echo "開発サーバーを起動中..."
echo "ブラウザで http://localhost:5173 を開いてください"
echo ""
npm run dev
