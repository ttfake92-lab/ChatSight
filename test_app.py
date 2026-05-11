#!/usr/bin/env python3
import json
import subprocess
import sys
import re

def test_wechat_sessions():
    """测试 wechat-cli sessions 命令"""
    print("=" * 60)
    print("测试 1: wechat-cli sessions")
    print("=" * 60)

    try:
        result = subprocess.run(
            ['wechat-cli', 'sessions', '--limit', '3'],
            capture_output=True,
            text=True,
            timeout=10
        )

        print(f"返回码: {result.returncode}")
        print(f"输出: {result.stdout[:500]}")

        if result.returncode == 0:
            data = json.loads(result.stdout)
            print(f"✅ 解析成功，共 {len(data)} 个会话")

            # 模拟前端的解析逻辑
            sessions = []
            for item in data:
                session = {
                    'id': item.get('username', ''),
                    'name': item.get('chat', ''),
                    'type': 'group' if item.get('is_group') else 'private',
                    'lastMessage': item.get('last_message', ''),
                    'lastMessageTime': '',
                    'unreadCount': item.get('unread', 0)
                }
                sessions.append(session)

            print(f"\n解析后的会话:")
            for s in sessions[:2]:
                print(f"  - {s['name']} ({s['type']}), unread: {s['unreadCount']}")

            return True
        else:
            print(f"❌ 命令失败: {result.stderr}")
            return False

    except Exception as e:
        print(f"❌ 异常: {e}")
        return False

def test_wechat_history():
    """测试 wechat-cli history 命令"""
    print("\n" + "=" * 60)
    print("测试 2: wechat-cli history")
    print("=" * 60)

    try:
        # 使用第一个会话的名称
        result = subprocess.run(
            ['wechat-cli', 'sessions', '--limit', '1'],
            capture_output=True,
            text=True,
            timeout=10
        )

        if result.returncode != 0:
            print(f"❌ 无法获取会话列表: {result.stderr}")
            return False

        sessions = json.loads(result.stdout)
        if not sessions:
            print("❌ 没有会话")
            return False

        session_name = sessions[0]['chat']
        print(f"获取会话 '{session_name}' 的聊天记录...")

        result = subprocess.run(
            ['wechat-cli', 'history', session_name, '--limit', '5'],
            capture_output=True,
            text=True,
            timeout=10
        )

        print(f"返回码: {result.returncode}")
        print(f"输出: {result.stdout[:800]}")

        if result.returncode == 0:
            data = json.loads(result.stdout)
            messages = data.get('messages', [])

            print(f"\n原始消息格式:")
            for msg in messages[:3]:
                print(f"  类型: {type(msg)}, 内容: {msg[:100]}")

            # 模拟前端的解析逻辑
            parsed_messages = []
            for i, msg in enumerate(messages):
                if isinstance(msg, str):
                    # 正则表达式匹配时间格式
                    pattern = r'^\[(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2})\]\s*(.+?):\s*(.+)$'
                    match = re.match(pattern, msg)

                    if match:
                        timestamp = match.group(1)
                        sender = match.group(2)
                        content = match.group(3)

                        parsed_messages.append({
                            'id': str(i),
                            'timestamp': timestamp,
                            'sender': sender,
                            'content': content,
                            'isSelf': False
                        })
                    else:
                        print(f"⚠️ 无法解析消息: {msg}")
                        parsed_messages.append({
                            'id': str(i),
                            'timestamp': '',
                            'sender': '未知',
                            'content': msg,
                            'isSelf': False
                        })

            print(f"\n✅ 解析成功，共 {len(parsed_messages)} 条消息")
            print(f"解析后的消息示例:")
            for msg in parsed_messages[:3]:
                print(f"  [{msg['timestamp']}] {msg['sender']}: {msg['content'][:50]}")

            return True
        else:
            print(f"❌ 命令失败: {result.stderr}")
            return False

    except Exception as e:
        print(f"❌ 异常: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_api_availability():
    """测试 AI API 可用性"""
    print("\n" + "=" * 60)
    print("测试 3: AI API 配置检查")
    print("=" * 60)

    # 检查环境变量
    import os

    openai_key = os.getenv('VITE_OPENAI_API_KEY', '')
    anthropic_key = os.getenv('VITE_ANTHROPIC_API_KEY', '')

    if openai_key:
        print(f"✅ OpenAI API Key 已配置: {openai_key[:10]}...")
    else:
        print(f"⚠️ OpenAI API Key 未配置")

    if anthropic_key:
        print(f"✅ Anthropic API Key 已配置: {anthropic_key[:10]}...")
    else:
        print(f"⚠️ Anthropic API Key 未配置")

    return bool(openai_key or anthropic_key)

if __name__ == '__main__':
    print("\n🔍 ChatSight 诊断测试\n")

    results = {
        'sessions': test_wechat_sessions(),
        'history': test_wechat_history(),
        'api': test_api_availability()
    }

    print("\n" + "=" * 60)
    print("测试结果汇总")
    print("=" * 60)

    for test_name, passed in results.items():
        status = "✅ 通过" if passed else "❌ 失败"
        print(f"{test_name}: {status}")

    all_passed = all(results.values())
    if all_passed:
        print("\n🎉 所有测试通过！")
        sys.exit(0)
    else:
        print("\n⚠️ 部分测试失败，请检查上述输出")
        sys.exit(1)
