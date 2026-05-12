from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import requests
import re
import json
import os

app = FastAPI(title="AI服务 - 向量嵌入与文本生成")

# ================================
# 数据模型
# ================================

class ChatRequest(BaseModel):
    prompt: str
    model: str = "chatglm3-6b"
    temperature: float = 0.7
    max_tokens: int = 2000

class ChatResponse(BaseModel):
    answer: str
    model: str

class EmbedRequest(BaseModel):
    text: str
    model: str = "bge-large-zh"

class EmbedResponse(BaseModel):
    embedding: List[float]
    model: str

# ================================
# 配置
# ================================

# Ollama 配置（本地大模型）
OLLAMA_URL = "http://localhost:11434"
OLLAMA_MODEL = "qwen:7b"

# 是否使用 Ollama
USE_OLLAMA = True

# ================================
# FAQ知识库
# ================================

# FAQ知识库路径
FAQ_PATH = os.path.join(os.path.dirname(__file__), "data", "faq-knowledge-base.json")

# 全局FAQ知识库
FAQ_KNOWLEDGE_BASE = None
FAQ_METADATA = None


def load_faq_knowledge_base():
    """加载FAQ知识库"""
    global FAQ_KNOWLEDGE_BASE, FAQ_METADATA
    
    try:
        if os.path.exists(FAQ_PATH):
            with open(FAQ_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
                FAQ_METADATA = data.get("metadata", {})
                FAQ_KNOWLEDGE_BASE = data.get("faqs", [])
                print(f"✅ FAQ知识库加载成功！共 {len(FAQ_KNOWLEDGE_BASE)} 个问答")
                print(f"   分类：{FAQ_METADATA.get('categories', [])}")
        else:
            print(f"⚠️ FAQ知识库文件不存在：{FAQ_PATH}")
            FAQ_KNOWLEDGE_BASE = []
    except Exception as e:
        print(f"❌ FAQ知识库加载失败：{e}")
        FAQ_KNOWLEDGE_BASE = []


def find_matching_faq(question: str):
    """
    在FAQ知识库中查找匹配的问题
    使用关键词匹配策略
    """
    if not FAQ_KNOWLEDGE_BASE:
        return None
    
    # 预处理用户问题
    question_lower = question.lower().strip()
    
    best_match = None
    best_score = 0
    
    # 遍历所有FAQ
    for faq in FAQ_KNOWLEDGE_BASE:
        score = 0
        
        # 直接匹配问题
        if faq["question"].lower() in question_lower:
            score += 100
        
        # 关键词匹配
        for keyword in faq.get("keywords", []):
            if keyword.lower() in question_lower:
                score += 10
        
        # 分类匹配（可选）
        if faq.get("category") and faq["category"].lower() in question_lower:
            score += 5
        
        # 更新最佳匹配
        if score > best_score:
            best_score = score
            best_match = faq
    
    # 只有分数足够高时才返回匹配结果
    if best_score >= 10:  # 至少匹配一个关键词
        return {
            "question": best_match["question"],
            "answer": best_match["answer"],
            "category": best_match.get("category"),
            "score": best_score
        }
    
    return None

# ================================
# 输入预处理与类型识别
# ================================

def preprocess_user_input(user_input):
    """
    预处理用户输入：清洗文本 + 识别输入类型
    返回：清洗后的文本 + 输入类型
    """
    # 1. 基础文本清洗：去除多余空格、特殊符号
    cleaned_input = user_input.strip()
    if not cleaned_input:
        return "", "unknown"
    
    # 2. 识别输入类型
    # 规则1：判断是否为数学计算
    math_pattern = r'^[\d\+\-\×\÷\*\(\)\.\s]+$'
    if re.match(math_pattern, cleaned_input):
        return cleaned_input, "math_calc"
    
    # 规则2：判断是否为代码片段
    code_keywords = ["def ", "import ", "=", "[", "]", "{", "}", ";", "print(", "if ", "for "]
    if any(keyword in cleaned_input for keyword in code_keywords):
        return cleaned_input, "code_snippet"
    
    # 规则3：默认判定为普通自然语言
    return cleaned_input, "normal_text"

def process_input(user_input):
    """
    主处理逻辑：根据输入类型针对性解析/转译
    """
    cleaned_text, input_type = preprocess_user_input(user_input)
    
    if input_type == "normal_text":
        return cleaned_text, input_type
    elif input_type == "math_calc":
        try:
            calc_text = cleaned_text.replace("×", "*").replace("÷", "/")
            result = eval(calc_text)
            return f"计算结果：{cleaned_text} = {result}", "calculated"
        except:
            return cleaned_text, input_type
    elif input_type == "code_snippet":
        return cleaned_text, input_type
    else:
        return cleaned_text, "unknown"

# ================================
# API 端点
# ================================

@app.on_event("startup")
async def startup_event():
    """启动时检查服务状态"""
    print("=" * 50)
    print("AI 服务启动中...")
    print("=" * 50)
    
    # 加载FAQ知识库
    load_faq_knowledge_base()
    
    if USE_OLLAMA:
        try:
            response = requests.get(f"{OLLAMA_URL}/api/tags", timeout=2)
            if response.status_code == 200:
                print(f"[OK] Ollama 服务可用：{OLLAMA_URL}")
                models = response.json().get('models', [])
                if models:
                    print(f"[OK] 可用模型：{[m['name'] for m in models]}")
                else:
                    print(f"[WARN] Ollama 没有安装模型，请运行：ollama pull {OLLAMA_MODEL}")
            else:
                print("[WARN] Ollama 服务响应异常")
        except Exception as e:
            print(f"[WARN] Ollama 不可用：{e}")
            print("   将使用模拟模式运行")
    
    print("=" * 50)
    print("[OK] AI 服务启动完成")
    print("=" * 50)

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    文本生成接口
    优先使用FAQ知识库，其次Ollama本地模型，否则返回模拟响应
    """
    try:
        # 预处理用户输入
        processed_text, input_type = process_input(request.prompt)
        print(f"[DEBUG] 输入类型：{input_type}，处理后文本：{repr(processed_text)}")
        
        # 如果是数学计算且已计算完成，直接返回结果
        if input_type == "calculated":
            return ChatResponse(answer=processed_text, model="calculator")
        
        # 1. 首先检查FAQ知识库
        print(f"[DEBUG] 检查FAQ知识库...")
        faq_match = find_matching_faq(request.prompt)
        
        if faq_match:
            print(f"✅ FAQ匹配成功！问题：{faq_match['question']}")
            print(f"   得分：{faq_match['score']}，分类：{faq_match['category']}")
            # 使用FAQ回答，并加上来源标识
            faq_answer = f"{faq_match['answer']}\n\n[来自知识库：{faq_match['category']}]"
            return ChatResponse(answer=faq_answer, model="faq-knowledge-base")
        
        # 2. FAQ中没有匹配，调用Ollama
        print(f"[DEBUG] FAQ未匹配，调用Ollama...")
        
        if USE_OLLAMA:
            import json
            headers = {
                "Content-Type": "application/json; charset=UTF-8",
                "Accept": "application/json; charset=UTF-8"
            }
            
            data = {
                "model": request.model if request.model and request.model != "chatglm3-6b" else OLLAMA_MODEL,
                "messages": [
                    {"role": "user", "content": processed_text}
                ],
                "stream": False
            }
            
            json_str = json.dumps(data, ensure_ascii=False)
            print(f"[DEBUG] 发送给 Ollama 的 JSON：{json_str[:200]}...")
            
            response = requests.post(
                f"{OLLAMA_URL}/api/chat",
                data=json_str.encode('utf-8'),
                headers=headers,
                timeout=60
            )
            response.encoding = 'utf-8'
            
            print(f"[DEBUG] Ollama 响应状态码：{response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                answer = result.get('message', {}).get('content', '生成失败')
                return ChatResponse(answer=answer, model=data["model"])
        
        # 3. Ollama不可用时使用模拟模式
        answer = f"【模拟模式】收到问题：{request.prompt}\n\n请安装 Ollama 并下载模型以获得真实回答：\n1. 安装 Ollama：https://ollama.com\n2. 运行：ollama pull qwen:7b"
        return ChatResponse(answer=answer, model="simulation")
        
    except Exception as e:
        print(f"[ERROR] 处理失败：{str(e)}")
        answer = f"AI 服务暂时不可用。\n\n错误信息：{str(e)}\n\n请检查：\n1. Ollama 是否已安装并运行\n2. 模型是否已下载：ollama pull qwen:7b"
        return ChatResponse(answer=answer, model="error")

@app.post("/embed", response_model=EmbedResponse)
async def embed(request: EmbedRequest):
    """向量嵌入接口"""
    try:
        import hashlib
        hash_obj = hashlib.md5(request.text.encode())
        hash_int = int(hash_obj.hexdigest(), 16)
        embedding = []
        for i in range(768):
            value = ((hash_int >> (i % 64)) % 1000) / 1000.0
            embedding.append(value)
        return EmbedResponse(embedding=embedding, model="simulation")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health():
    """健康检查接口"""
    return {
        "status": "healthy",
        "service": "ai-service",
        "ollama": "available" if check_ollama() else "unavailable"
    }

@app.get("/faq/status")
async def faq_status():
    """获取FAQ知识库状态"""
    return {
        "status": "ok",
        "faq_count": len(FAQ_KNOWLEDGE_BASE) if FAQ_KNOWLEDGE_BASE else 0,
        "metadata": FAQ_METADATA,
        "categories": FAQ_METADATA.get("categories", []) if FAQ_METADATA else []
    }


@app.get("/faq/list")
async def faq_list(limit: int = 10, category: Optional[str] = None):
    """获取FAQ列表"""
    if not FAQ_KNOWLEDGE_BASE:
        return {"faqs": [], "count": 0}
    
    faqs = FAQ_KNOWLEDGE_BASE
    if category:
        faqs = [f for f in faqs if f.get("category") == category]
    
    return {
        "faqs": faqs[:limit],
        "count": len(faqs)
    }


@app.post("/faq/match")
async def faq_match(question: str):
    """测试FAQ匹配功能"""
    match = find_matching_faq(question)
    if match:
        return {
            "matched": True,
            "result": match
        }
    else:
        return {
            "matched": False,
            "result": None,
            "message": "没有找到匹配的FAQ"
        }


@app.get("/")
async def root():
    """根路径"""
    return {
        "service": "AI 服务",
        "version": "1.0.0",
        "endpoints": {
            "chat": "/chat",
            "embed": "/embed",
            "health": "/health",
            "faq_status": "/faq/status",
            "faq_list": "/faq/list",
            "faq_match": "/faq/match"
        }
    }

# ================================
# 辅助函数
# ================================

def check_ollama() -> bool:
    """检查 Ollama 服务是否可用"""
    try:
        response = requests.get(f"{OLLAMA_URL}/api/tags", timeout=2)
        return response.status_code == 200
    except:
        return False

# ================================
# 启动服务
# ================================

if __name__ == "__main__":
    print("\n" + "=" * 50)
    print("  高等教育质量监测AI系统 - AI服务")
    print("=" * 50)
    print("\n  服务地址: http://localhost:8000")
    print("  API文档:  http://localhost:8000/docs")
    print("  健康检查: http://localhost:8000/health")
    print("\n" + "=" * 50 + "\n")
    
    uvicorn.run(app, host="0.0.0.0", port=8000)