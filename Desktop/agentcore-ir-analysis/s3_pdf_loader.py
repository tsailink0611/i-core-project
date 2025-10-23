"""
S3からPDFを読み込んでテキストを抽出するヘルパーモジュール
"""

import boto3
import pymupdf
import io
import tempfile
from typing import List, Dict, Any
import json

# S3バケット設定
S3_BUCKET = 'ir-analysis-demo-takashi-20250907'
S3_REGION = 'us-east-1'

def list_pdfs_in_s3(company_name: str = None) -> List[str]:
    """
    S3バケットからPDFファイルのリストを取得
    
    Args:
        company_name: 企業名でフィルタリング（オプション）
        
    Returns:
        PDFファイルのキーのリスト
    """
    s3_client = boto3.client('s3', region_name=S3_REGION)
    
    try:
        # バケット内の全オブジェクトをリスト
        response = s3_client.list_objects_v2(Bucket=S3_BUCKET)
        
        if 'Contents' not in response:
            return []
        
        # PDFファイルのみをフィルタリング
        pdf_files = [
            obj['Key'] for obj in response['Contents']
            if obj['Key'].endswith('.pdf')
        ]
        
        # 企業名でフィルタリング（指定された場合）
        if company_name:
            pdf_files = [
                key for key in pdf_files
                if company_name in key
            ]
        
        return pdf_files
        
    except Exception as e:
        print(f"[エラー] S3リスト取得失敗: {str(e)}")
        return []

def download_pdf_from_s3(s3_key: str) -> bytes:
    """
    S3からPDFをダウンロード
    
    Args:
        s3_key: S3オブジェクトキー
        
    Returns:
        PDFのバイトデータ
    """
    s3_client = boto3.client('s3', region_name=S3_REGION)
    
    try:
        # S3からオブジェクトを取得
        response = s3_client.get_object(Bucket=S3_BUCKET, Key=s3_key)
        pdf_bytes = response['Body'].read()
        
        return pdf_bytes
        
    except Exception as e:
        print(f"[エラー] S3ダウンロード失敗 ({s3_key}): {str(e)}")
        return None

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """
    PDFバイトデータからテキストを抽出
    
    Args:
        pdf_bytes: PDFのバイトデータ
        
    Returns:
        抽出されたテキスト
    """
    try:
        # PyMuPDFでPDFを開く（バイトデータから）
        doc = pymupdf.open(stream=pdf_bytes, filetype="pdf")
        
        # 全ページからテキストを抽出
        text_parts = []
        for page_num in range(len(doc)):
            page = doc[page_num]
            text = page.get_text()
            text_parts.append(text)
        
        doc.close()
        
        # 全ページのテキストを結合
        full_text = "\n\n".join(text_parts)
        
        return full_text
        
    except Exception as e:
        print(f"[エラー] PDFテキスト抽出失敗: {str(e)}")
        return ""

def get_pdf_content(s3_key: str) -> Dict[str, Any]:
    """
    S3からPDFをダウンロードしてテキストを抽出
    
    Args:
        s3_key: S3オブジェクトキー
        
    Returns:
        {"key": s3_key, "text": 抽出テキスト, "char_count": 文字数}
    """
    pdf_bytes = download_pdf_from_s3(s3_key)
    
    if pdf_bytes is None:
        return {"key": s3_key, "text": "", "char_count": 0, "error": "ダウンロード失敗"}
    
    text = extract_text_from_pdf(pdf_bytes)
    
    return {
        "key": s3_key,
        "text": text,
        "char_count": len(text),
        "size_bytes": len(pdf_bytes)
    }

def search_pdfs_by_company(company_name: str) -> List[Dict[str, Any]]:
    """
    企業名でPDFを検索して内容を取得
    
    Args:
        company_name: 企業名
        
    Returns:
        PDFの内容のリスト
    """
    # PDFファイルリストを取得
    pdf_keys = list_pdfs_in_s3(company_name)
    
    print(f"[情報] {company_name}の{len(pdf_keys)}件のPDFを発見")
    
    # 各PDFの内容を取得
    results = []
    for key in pdf_keys[:5]:  # 最大5件まで処理
        print(f"[処理中] {key}")
        content = get_pdf_content(key)
        results.append(content)
    
    return results

def embed_text_with_titan(text: str) -> List[float]:
    """
    テキストをTitan Embedでベクトル化
    
    Args:
        text: ベクトル化するテキスト
        
    Returns:
        1024次元のベクトル
    """
    bedrock_runtime = boto3.client("bedrock-runtime", region_name=S3_REGION)
    
    try:
        # テキストが長すぎる場合は最初の5000文字のみ使用（トークン制限対策）
        if len(text) > 5000:
            text = text[:5000]
        
        response = bedrock_runtime.invoke_model(
            body=json.dumps({"inputText": text}),
            modelId="amazon.titan-embed-text-v2:0",
            contentType="application/json",
            accept="application/json"
        )
        
        embedding_result = json.loads(response.get("body").read())
        embedding = embedding_result.get("embedding")
        
        return embedding
        
    except Exception as e:
        print(f"[エラー] Titan Embed失敗: {str(e)}")
        return None

def calculate_cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
    """
    コサイン類似度を計算
    
    Args:
        vec1: ベクトル1
        vec2: ベクトル2
        
    Returns:
        類似度 (0.0 - 1.0)
    """
    import math
    
    # ドット積
    dot_product = sum(a * b for a, b in zip(vec1, vec2))
    
    # ノルム
    norm1 = math.sqrt(sum(a * a for a in vec1))
    norm2 = math.sqrt(sum(b * b for b in vec2))
    
    # コサイン類似度
    if norm1 == 0 or norm2 == 0:
        return 0.0
    
    similarity = dot_product / (norm1 * norm2)
    
    return similarity

# テスト用
if __name__ == "__main__":
    print("=== S3 PDF Loader テスト ===")
    
    # トヨタのPDFを検索
    pdfs = list_pdfs_in_s3("トヨタ")
    print(f"\nトヨタのPDF: {len(pdfs)}件")
    for pdf in pdfs[:3]:
        print(f"  - {pdf}")
    
    # 最初のPDFからテキスト抽出
    if pdfs:
        content = get_pdf_content(pdfs[0])
        print(f"\n{pdfs[0]}:")
        print(f"  文字数: {content['char_count']}")
        print(f"  サイズ: {content['size_bytes']} bytes")
        print(f"  テキスト（先頭200文字）:\n  {content['text'][:200]}")
