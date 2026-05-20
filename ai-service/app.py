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


def should_query_database_first(question: str):
    """
    判断是否应该优先查询数据库（而不是FAQ）
    返回：
        True - 应该优先查数据库
        False - 优先查FAQ
    """
    question_lower = question.lower().strip()
    
    # 数据库查询关键词（应该优先查数据库的关键词
    db_keywords = [
        "学号", "学生", "学分", "成绩", "教学", "教师", "课程", "学院",
        "目前", "学生情况", "信息", "怎么样", "如何",
        "多少个", "有多少",
        "情况", "现状", "情况是",
        "教学资源", "师资", "投入", "投入情况"
    ]
    
    # 包含这些关键词的问题，优先查数据库
    for keyword in db_keywords:
        if keyword in question_lower:
            print(f"[DEBUG] 检测到数据库查询关键词：{keyword}，优先查数据库")
            return True
    
    # 学号格式检测：纯数字或者包含特定格式
    # 检测是否有学号（通常是12位数字）
    import re
    if re.search(r"\d{10,}", question_lower):
        print("[DEBUG] 检测到数字模式，优先查数据库")
        return True
    
    return False


def find_matching_faq(question: str):
    """
    在FAQ知识库中查找匹配的问题
    使用增强的匹配策略：精确匹配优先 + 关键词权重增强 + 相似度计算
    注意：如果判断是否应该查数据库时，会降低FAQ匹配
    """
    # 先判断是否应该优先查数据库
    if should_query_database_first(question):
        print("[DEBUG] 问题类型判断：应该优先查数据库，降低FAQ匹配分数")
        # 如果是数据库查询类型，不匹配，但FAQ阈值大幅提高匹配门槛
        min_score = 500  # 提高到非常高的阈值，才匹配要求
    else:
        min_score = 100  # 正常FAQ匹配阈值
    
    if not FAQ_KNOWLEDGE_BASE:
        return None
    
    # 预处理用户问题
    question_lower = question.lower().strip()
    question_clean = question_lower
    
    best_match = None
    best_score = 0
    
    # 遍历所有FAQ
    for faq in FAQ_KNOWLEDGE_BASE:
        score = 0
        faq_question_lower = faq["question"].lower()
        faq_category_lower = faq.get("category", "").lower()
        
        # ============= 1. 精确匹配（最高优先级）=============
        if question_lower == faq_question_lower:
            score += 1000  # 完全一致，给最高权重
        
        # ============= 2. 问题包含关系（高优先级）=============
        elif faq_question_lower in question_lower:
            score += 500
        elif question_lower in faq_question_lower:
            score += 300
        
        # ============= 3. 关键词匹配（非常重要）=============
        keyword_match_count = 0
        for keyword in faq.get("keywords", []):
            keyword_lower = keyword.lower()
            if keyword_lower in question_lower:
                # 根据关键词长度调整权重
                keyword_score = 50 + (len(keyword) * 3)
                score += keyword_score
                keyword_match_count += 1
        
        # 如果匹配了多个关键词，给予额外奖励
        if keyword_match_count >= 3:
            score += 200
        elif keyword_match_count == 2:
            score += 80
        
        # ============= 4. 分类匹配（重要辅助）=============
        if faq_category_lower in question_lower:
            score += 100
        
        # ============= 5. 词重叠
        question_words = set(question_lower.split())
        faq_words = set(faq_question_lower.split())
        common_words = question_words & faq_words
        word_overlap_score = len(common_words) * 40
        score += word_overlap_score
        
        # ============= 6. 特别关键词优先
        # 学费相关
        if any(k in question_lower for k in ["学费", "多少钱", "费用", "收费"]):
            if "缴费" in faq_category_lower or "学费" in faq_question_lower:
                score += 300
        
        # 请假相关
        if any(k in question_lower for k in ["请假", "事假", "休假", "离校", "申请假期"]):
            if "请假" in faq_category_lower or "请假" in faq_question_lower:
                score += 300
        
        # 奖学金相关
        if any(k in question_lower for k in ["奖学金", "助学金", "奖励", "资助", "补助"]):
            if "缴费" in faq_category_lower and any(k in faq_question_lower for k in ["奖学金", "助学金"]):
                score += 300
        
        # 更新最佳匹配
        if score > best_score:
            best_score = score
            best_match = faq
    
    print(f"[DEBUG] 最佳匹配得分：{best_score}，阈值：{min_score}")
    if best_match:
        print(f"[DEBUG] 匹配问题：{best_match['question']}")
        print(f"[DEBUG] 匹配分类：{best_match.get('category')}")
    
    # 根据是否是数据库查询类型，使用更高的阈值
    if best_score >= min_score:
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
    智能判断：优先FAQ，然后判断是否需要后端查数据库
    """
    try:
        prompt = request.prompt
        
        # 关键判断：如果prompt已经包含知识库或数据库数据（也就是NestJS发来的完整prompt）
        # 这时候应该直接调用Ollama生成回答，不要再判断是否需要查数据库
        if "知识数据" in prompt or "学生总数" in prompt or "学生信息" in prompt:
            print(f"[DEBUG] 检测到包含知识库/数据库数据的完整prompt，直接调用Ollama")
            if USE_OLLAMA:
                import json
                headers = {
                    "Content-Type": "application/json; charset=UTF-8",
                    "Accept": "application/json; charset=UTF-8"
                }
                
                data = {
                    "model": request.model if request.model and request.model != "chatglm3-6b" else OLLAMA_MODEL,
                    "messages": [
                        {"role": "user", "content": prompt}
                    ],
                    "stream": False
                }
                
                json_str = json.dumps(data, ensure_ascii=False)
                print(f"[DEBUG] 发送给Ollama的JSON：{json_str[:200]}...")
                
                response = requests.post(
                    f"{OLLAMA_URL}/api/chat",
                    data=json_str.encode('utf-8'),
                    headers=headers,
                    timeout=60
                )
                response.encoding = 'utf-8'
                
                print(f"[DEBUG] Ollama响应状态码：{response.status_code}")
                
                if response.status_code == 200:
                    result = response.json()
                    answer = result.get('message', {}).get('content', '生成失败')
                    return ChatResponse(answer=answer, model=data["model"])
            
            # Ollama不可用时使用模拟模式
            answer = f"【模拟模式】收到问题：{prompt}\n\n请安装Ollama并下载模型以获得真实回答：\n1. 安装Ollama：https://ollama.com\n2. 运行：ollama pull qwen:7b"
            return ChatResponse(answer=answer, model="simulation")
        
        # 下面是普通问题的处理逻辑
        
        # 预处理用户输入
        processed_text, input_type = process_input(prompt)
        print(f"[DEBUG] 输入类型：{input_type}，处理后文本：{repr(processed_text)}")
        
        # 如果是数学计算且已计算完成，直接返回结果
        if input_type == "calculated":
            return ChatResponse(answer=processed_text, model="calculator")
        
        # 1. 首先检查FAQ知识库
        print(f"[DEBUG] 检查FAQ知识库...")
        faq_match = find_matching_faq(prompt)
        
        # 2. 判断是否需要后端继续查数据库
        needs_db_query = should_query_database_first(prompt)
        
        if faq_match and not needs_db_query:
            # FAQ匹配成功，且不是数据库查询类型 → 直接返回FAQ
            print(f"✅ FAQ匹配成功！问题：{faq_match['question']}")
            print(f"   得分：{faq_match['score']}，分类：{faq_match['category']}")
            # 使用FAQ回答，并加上来源标识
            faq_answer = f"{faq_match['answer']}\n\n[来自知识库：{faq_match['category']}]"
            return ChatResponse(answer=faq_answer, model="faq-knowledge-base")
        
        # 3. FAQ未匹配，或者是数据库查询类型 → 返回标志，让后端继续处理
        if needs_db_query:
            print(f"[DEBUG] 判断为数据库查询，让后端继续处理")
            # 返回一个特殊标识，让NestJS知道应该继续查数据库
            # NestJS会检测这个特殊回答，然后继续走数据库查询流程
            return ChatResponse(answer="__NEED_DB_QUERY__", model="db-query-needed")
        
        # 4. 普通问题，FAQ未匹配，调用Ollama
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
            print(f"[DEBUG] 发送给Ollama的JSON：{json_str[:200]}...")
            
            response = requests.post(
                f"{OLLAMA_URL}/api/chat",
                data=json_str.encode('utf-8'),
                headers=headers,
                timeout=60
            )
            response.encoding = 'utf-8'
            
            print(f"[DEBUG] Ollama响应状态码：{response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                answer = result.get('message', {}).get('content', '生成失败')
                return ChatResponse(answer=answer, model=data["model"])
        
        # 5. Ollama不可用时使用模拟模式
        answer = f"【模拟模式】收到问题：{prompt}\n\n请安装Ollama并下载模型以获得真实回答：\n1. 安装Ollama：https://ollama.com\n2. 运行：ollama pull qwen:7b"
        return ChatResponse(answer=answer, model="simulation")
        
    except Exception as e:
        print(f"[ERROR] 处理失败：{str(e)}")
        answer = f"AI服务暂时不可用。\n\n错误信息：{str(e)}\n\n请检查：\n1. Ollama是否已安装并运行\n2. 模型是否已下载：ollama pull qwen:7b"
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