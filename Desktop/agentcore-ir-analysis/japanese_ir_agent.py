"""
日本語完全対応IR分析AgentCoreエージェント
企業資料・IR・決算書などの包括的分析システム
"""

from bedrock_agentcore import BedrockAgentCoreApp
from typing import Dict, Any, List
import boto3
import json
import re
from s3_pdf_loader import (
    list_pdfs_in_s3,
    get_pdf_content,
    embed_text_with_titan,
    calculate_cosine_similarity
)

app = BedrockAgentCoreApp()

@app.entrypoint
def invoke(payload: dict) -> str:
    """
    日本語対応エージェントエントリーポイント
    
    対応クエリ例:
    - "トヨタ自動車の2024年第1四半期決算を分析してください"
    - "ソニーの財務指標とROEを計算して"
    - "任天堂の売上推移を過去3年分で比較"
    """
    
    query = payload.get('query', payload.get('prompt', '分析をお手伝いします'))
    
    print(f"[エージェント] 受信クエリ: {query}")
    
    # 1. 日本語意図解析
    analysis_result = analyze_japanese_query(query)
    print(f"[分析] 解析結果: {analysis_result}")
    
    # 2. 必要な処理を実行
    results = []
    
    if analysis_result.get('needs_document_search'):
        search_result = search_japanese_documents(query, analysis_result)
        results.append(search_result)
    
    if analysis_result.get('needs_financial_calculation'):
        calc_result = calculate_financial_metrics(query, analysis_result)
        results.append(calc_result)
    
    if analysis_result.get('needs_trend_analysis'):
        trend_result = analyze_business_trends(query, analysis_result)
        results.append(trend_result)
    
    # 3. 日本語で統合回答生成
    final_response = generate_japanese_response(query, results, analysis_result)
    
    return final_response

def analyze_japanese_query(query: str) -> Dict[str, Any]:
    """日本語クエリの詳細分析"""
    
    # 企業名抽出（より多くのパターンに対応）
    company_patterns = [
        r'(トヨタ|TOYOTA|toyota|トヨタ自動車)',
        r'(三菱UFJ|MUFG|三菱|三菱UFJフィナンシャル)',
        r'(武田薬品|Takeda|武田|タケダ)',
        r'(ソニー|SONY|sony)',
        r'(任天堂|Nintendo|nintendo)',
        r'(ソフトバンク|SoftBank|softbank)',
        r'(楽天|Rakuten|rakuten)',
        r'(パナソニック|Panasonic|panasonic)',
        r'(日産|NISSAN|nissan)',
        r'(ホンダ|HONDA|honda)',
        r'(オリエンタルランド|OLC)'
    ]
    
    detected_companies = []
    for pattern in company_patterns:
        if re.search(pattern, query, re.IGNORECASE):
            detected_companies.append(re.search(pattern, query, re.IGNORECASE).group(1))
    
    # 分析タイプ判定
    intent_keywords = {
        'document_search': [
            '決算', '財務', '業績', 'IR', '資料', '報告書', '分析',
            '決算書', '有価証券報告書', '四半期', '年次', '中期計画'
        ],
        'financial_calculation': [
            'ROE', 'ROA', 'PER', 'PBR', '利益率', '成長率', 
            '売上高', '営業利益', '純利益', '総資産', '自己資本'
        ],
        'trend_analysis': [
            '推移', '変化', '比較', 'トレンド', '成長', '減少',
            '過去', '将来', '予測', '見通し', '傾向'
        ],
        'time_period': [
            '2024年', '2023年', '2022年', '第1四半期', '第2四半期',
            '第3四半期', '第4四半期', '上半期', '下半期', '年度'
        ]
    }
    
    detected_intents = {}
    for intent_type, keywords in intent_keywords.items():
        matches = [kw for kw in keywords if kw in query]
        detected_intents[intent_type] = matches
    
    return {
        'original_query': query,
        'detected_companies': detected_companies,
        'primary_company': detected_companies[0] if detected_companies else None,
        'needs_document_search': bool(detected_intents['document_search']),
        'needs_financial_calculation': bool(detected_intents['financial_calculation']),
        'needs_trend_analysis': bool(detected_intents['trend_analysis']),
        'time_period': detected_intents.get('time_period', []),
        'financial_metrics': detected_intents.get('financial_calculation', []),
        'analysis_focus': detected_intents
    }

def search_japanese_documents(query: str, analysis: Dict) -> Dict[str, Any]:
    """日本語文書検索（S3 + Titan Embed）"""
    
    try:
        # AWS Bedrock Runtimeクライアント
        bedrock_runtime = boto3.client("bedrock-runtime", region_name="us-east-1")
        
        # 検索クエリの最適化
        company = analysis.get('primary_company', '企業')
        search_query = f"{company} {' '.join(analysis.get('financial_metrics', []))} 財務分析"
        
        # Titan Embedによる埋め込み生成
        response = bedrock_runtime.invoke_model(
            body=json.dumps({"inputText": search_query}),
            modelId="amazon.titan-embed-text-v2:0",
            contentType="application/json",
            accept="application/json"
        )
        
        embedding_result = json.loads(response.get("body").read())
        query_embedding = embedding_result.get("embedding")
        
        if query_embedding:
            # S3から実データのPDFを取得
            print(f"[検索] {company}のPDFを検索中...")
            pdf_keys = list_pdfs_in_s3(company)

            if not pdf_keys:
                return {
                    "status": "success",
                    "search_query": search_query,
                    "company": company,
                    "documents_found": 0,
                    "top_matches": [],
                    "similarity_scores": [],
                    "key_findings": [f"{company}のPDFがS3に見つかりませんでした"]
                }

            # 各PDFの類似度を計算
            similarities = []
            for pdf_key in pdf_keys[:10]:  # 最大10件まで処理
                print(f"[処理] {pdf_key}")
                content = get_pdf_content(pdf_key)

                if content['text']:
                    # PDFのテキストをベクトル化（トークン制限対策：5000文字まで）
                    doc_embedding = embed_text_with_titan(content['text'][:5000])

                    if doc_embedding:
                        # 類似度計算
                        similarity = calculate_cosine_similarity(query_embedding, doc_embedding)
                        similarities.append({
                            "key": pdf_key,
                            "similarity": similarity,
                            "text": content['text']
                        })

            # 類似度でソート
            similarities.sort(key=lambda x: x['similarity'], reverse=True)
            top_results = similarities[:3]

            # キーワードから重要な発見事項を抽出
            key_findings = []
            for result in top_results:
                text_snippet = result['text'][:500]
                # 数値パターンを探す
                if '%' in text_snippet or '億円' in text_snippet or '百万円' in text_snippet:
                    lines = text_snippet.split('\n')
                    for line in lines[:5]:
                        if line.strip() and len(line) > 10:
                            key_findings.append(line.strip())
                            if len(key_findings) >= 3:
                                break
                if len(key_findings) >= 3:
                    break

            return {
                "status": "success",
                "search_query": search_query,
                "company": company,
                "documents_found": len(pdf_keys),
                "top_matches": [r['key'] for r in top_results],
                "similarity_scores": [r['similarity'] for r in top_results],
                "key_findings": key_findings if key_findings else [f"{company}の文書から重要情報を分析中"]
            }
        else:
            return {"status": "error", "message": "埋め込み生成に失敗しました"}
            
    except Exception as e:
        return {"status": "error", "message": f"文書検索エラー: {str(e)}"}

def calculate_financial_metrics(query: str, analysis: Dict) -> Dict[str, Any]:
    """財務指標計算（日本語対応）"""
    
    company = analysis.get('primary_company', '対象企業')
    metrics = analysis.get('financial_metrics', [])
    
    # サンプル財務データ（実際はS3等から取得）
    sample_data = {
        'sales_revenue': 28500000,  # 売上高（百万円）
        'operating_profit': 2280000,  # 営業利益
        'net_income': 1710000,  # 当期純利益  
        'total_assets': 45200000,  # 総資産
        'shareholders_equity': 29500000,  # 自己資本
        'shares_outstanding': 1580000  # 発行済株式数（千株）
    }
    
    # 財務指標計算
    calculated_metrics = {}
    
    if 'ROE' in str(metrics) or 'roe' in query.lower():
        roe = (sample_data['net_income'] / sample_data['shareholders_equity']) * 100
        calculated_metrics['ROE'] = f"{roe:.1f}%"
    
    if 'ROA' in str(metrics) or 'roa' in query.lower():
        roa = (sample_data['net_income'] / sample_data['total_assets']) * 100
        calculated_metrics['ROA'] = f"{roa:.1f}%"
    
    if '利益率' in query or '営業利益' in query:
        margin = (sample_data['operating_profit'] / sample_data['sales_revenue']) * 100
        calculated_metrics['営業利益率'] = f"{margin:.1f}%"
    
    return {
        "status": "success",
        "company": company,
        "period": "2024年第1四半期",
        "calculated_metrics": calculated_metrics,
        "base_data": {
            "売上高": f"{sample_data['sales_revenue']:,}百万円",
            "営業利益": f"{sample_data['operating_profit']:,}百万円", 
            "当期純利益": f"{sample_data['net_income']:,}百万円",
            "総資産": f"{sample_data['total_assets']:,}百万円",
            "自己資本": f"{sample_data['shareholders_equity']:,}百万円"
        }
    }

def analyze_business_trends(query: str, analysis: Dict) -> Dict[str, Any]:
    """事業トレンド分析"""
    
    company = analysis.get('primary_company', '対象企業')
    
    # サンプルトレンドデータ
    trend_data = {
        "売上高推移": {
            "2022年": "24,800百万円",
            "2023年": "26,200百万円", 
            "2024年Q1": "7,125百万円"
        },
        "成長率": {
            "2023年成長率": "+5.6%",
            "2024年予想": "+8.8%"
        }
    }
    
    return {
        "status": "success",
        "company": company,
        "trend_analysis": trend_data,
        "insights": [
            f"{company}は安定した成長軌道を維持",
            "市場シェア拡大により競合優位性を確保",
            "デジタル変革投資が収益性向上に寄与"
        ]
    }

def generate_japanese_response(query: str, results: List[Dict], analysis: Dict) -> str:
    """Claude 4.5 Haikuによる日本語統合レスポンス生成"""

    # 検索結果を整形してClaudeに渡す
    context_data = []

    for result in results:
        if result.get("status") == "success":
            if "documents_found" in result:
                context_data.append(f"""
文書検索結果:
- 企業: {result.get('company', '不明')}
- 発見文書数: {result.get('documents_found', 0)}件
- 主要文書: {', '.join(result.get('top_matches', [])[:3])}
- 関連度: {', '.join([f"{s:.0%}" for s in result.get('similarity_scores', [])[:3]])}
- 重要発見: {'; '.join(result.get('key_findings', [])[:5])}
""")

            if "calculated_metrics" in result:
                metrics_str = ', '.join([f"{k}: {v}" for k, v in result.get('calculated_metrics', {}).items()])
                context_data.append(f"""
財務指標:
- 期間: {result.get('period', '不明')}
- 計算結果: {metrics_str}
""")

            if "trend_analysis" in result:
                context_data.append(f"トレンド分析: {result.get('trend_analysis', {})}")

    # Claude 4.5 Haikuに分析を依頼
    bedrock_runtime = boto3.client("bedrock-runtime", region_name="us-east-1")

    prompt = f"""あなたは企業IR分析の専門家です。以下の情報を基に、ユーザーの質問に対して包括的で分かりやすい分析レポートを日本語で作成してください。

ユーザーの質問:
{query}

検索・分析結果:
{chr(10).join(context_data)}

以下の形式でレポートを作成してください:
1. 概要（2-3行）
2. 主要な発見事項（箇条書き）
3. 財務状況の評価（該当する場合）
4. 今後の見通しや示唆

プロフェッショナルかつ具体的に、数値やデータを活用して分析してください。"""

    try:
        response = bedrock_runtime.invoke_model(
            modelId="us.anthropic.claude-haiku-4-5-20251001-v1:0",  # Claude Haiku 4.5 (Cross-Region Inference Profile)
            body=json.dumps({
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": 4096,
                "temperature": 0.7,
                "messages": [
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            })
        )

        response_body = json.loads(response.get('body').read())
        claude_analysis = response_body.get('content', [{}])[0].get('text', '')

        # Claude Haiku 4.5の分析結果を返す
        return f"""🎯 『{query}』の分析結果

{claude_analysis}

---
🤖 **分析エンジン**: Amazon Bedrock - Claude Haiku 4.5
📅 **分析日時**: 2025年10月24日
🔍 **分析対象**: {analysis.get('primary_company', 'IR文書')}
"""

    except Exception as e:
        print(f"[エラー] Claude Haiku 4.5呼び出し失敗: {str(e)}")

        # フォールバック: シンプルな結果表示
        fallback_response = [
            f"🎯 『{query}』の分析結果",
            "",
            "📊 **検索結果**:"
        ]

        for result in results:
            if result.get("status") == "success" and "documents_found" in result:
                fallback_response.append(f"- 発見文書: {result['documents_found']}件")
                fallback_response.append(f"- 主要文書: {', '.join(result.get('top_matches', [])[:3])}")

        fallback_response.append(f"\n⚠️ AI分析エンジンエラー: {str(e)}")

        return "\n".join(fallback_response)

# メイン実行（HTTPサーバー起動）
if __name__ == "__main__":
    import uvicorn
    
    print("=== 日本語IR分析AgentCore起動中 ===")
    print("サーバー: http://localhost:8080")
    print("エンドポイント: /invocations")
    print("対応言語: 日本語完全対応")
    print("分析対象: IR資料、決算書、企業レポート等")
    
    uvicorn.run(app, host="0.0.0.0", port=8080)