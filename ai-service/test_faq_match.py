#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
FAQ匹配测试脚本
"""
import json
import os

# 导入app.py中的函数
import sys
sys.path.insert(0, os.path.dirname(__file__))

# 手动加载FAQ知识库
FAQ_PATH = os.path.join(os.path.dirname(__file__), "data", "faq-knowledge-base.json")

def load_faq_knowledge_base():
    """加载FAQ知识库"""
    try:
        if os.path.exists(FAQ_PATH):
            with open(FAQ_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
                faq_list = data.get("faqs", [])
                print("OK FAQ知识库加载成功！共", len(faq_list), "个问答")
                return faq_list
        else:
            print("WARN FAQ知识库文件不存在：", FAQ_PATH)
            return []
    except Exception as e:
        print("ERROR FAQ知识库加载失败：", e)
        return []

def enhanced_find_matching_faq(question: str, faq_list):
    """
    在FAQ知识库中查找匹配的问题 - 使用增强的匹配策略
    """
    if not faq_list:
        return None
    
    question_lower = question.lower().strip()
    
    best_match = None
    best_score = 0
    
    for faq in faq_list:
        score = 0
        faq_question_lower = faq["question"].lower()
        faq_category_lower = faq.get("category", "").lower()
        
        # 1. 精确匹配（最高优先级）
        if question_lower == faq_question_lower:
            score += 1000
        
        # 2. 问题包含关系
        elif faq_question_lower in question_lower:
            score += 500
        elif question_lower in faq_question_lower:
            score += 300
        
        # 3. 关键词匹配
        keyword_match_count = 0
        for keyword in faq.get("keywords", []):
            keyword_lower = keyword.lower()
            if keyword_lower in question_lower:
                keyword_score = 50 + (len(keyword) * 3)
                score += keyword_score
                keyword_match_count += 1
        
        if keyword_match_count >= 3:
            score += 200
        elif keyword_match_count == 2:
            score += 80
        
        # 4. 分类匹配
        if faq_category_lower in question_lower:
            score += 100
        
        # 5. 词重叠
        question_words = set(question_lower.split())
        faq_words = set(faq_question_lower.split())
        common_words = question_words & faq_words
        word_overlap_score = len(common_words) * 40
        score += word_overlap_score
        
        # 6. 特别关键词优化
        if any(k in question_lower for k in ["学费", "多少钱", "费用", "收费"]):
            if "缴费" in faq_category_lower or "学费" in faq_question_lower:
                score += 300
        
        if any(k in question_lower for k in ["请假", "事假", "休假", "离校", "申请假期"]):
            if "请假" in faq_category_lower or "请假" in faq_question_lower:
                score += 300
        
        if any(k in question_lower for k in ["奖学金", "助学金", "奖励", "资助", "补助"]):
            if "缴费" in faq_category_lower and any(k in faq_question_lower for k in ["奖学金", "助学金"]):
                score += 300
        
        if score > best_score:
            best_score = score
            best_match = faq
    
    if best_score >= 100:
        return {
            "question": best_match["question"],
            "answer": best_match["answer"],
            "category": best_match.get("category"),
            "score": best_score
        }
    return None

def test_faq_matching():
    """测试FAQ匹配"""
    faq_list = load_faq_knowledge_base()
    if not faq_list:
        print("ERROR 没有FAQ数据，无法测试")
        return
    
    print("\n" + "=" * 80)
    print("FAQ匹配测试")
    print("=" * 80 + "\n")
    
    test_questions = [
        "学费是多少？",
        "奖学金是多少？", 
        "请假流程是怎么样的？",
        "学校的王牌专业是什么？",
        "学费可以分期缴纳吗？"
    ]
    
    for q in test_questions:
        print("\n测试问题：", q)
        print("-" * 80)
        
        match = enhanced_find_matching_faq(q, faq_list)
        
        if match:
            print("OK 找到匹配！")
            print("   匹配问题：", match["question"])
            print("   得分：", match["score"])
            print("   分类：", match["category"])
            print("   回答：", match["answer"][:100], "...")
        else:
            print("NOT FOUND 未找到匹配")
        print()

if __name__ == "__main__":
    test_faq_matching()
