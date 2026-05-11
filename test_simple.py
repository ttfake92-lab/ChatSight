from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    page = browser.new_page()
    
    # 捕获控制台和错误
    console_messages = []
    page.on("console", lambda msg: console_messages.append(f"[{msg.type}] {msg.text}"))
    page.on("pageerror", lambda err: console_messages.append(f"[ERROR] {err}"))
    
    print("🚀 打开 http://localhost:5173")
    page.goto('http://localhost:5173')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(5000)  # 等待加载
    
    print("\n" + "=" * 60)
    print("📋 控制台日志:")
    print("=" * 60)
    for msg in console_messages:
        print(msg)
    
    # 检查 window.electronAPI
    print("\n" + "=" * 60)
    print("🔍 window.electronAPI 状态:")
    print("=" * 60)
    result = page.evaluate("""() => {
        if (!window.electronAPI) return {exists: false}
        return {
            exists: true,
            hasWechat: !!window.electronAPI.wechat,
            methods: window.electronAPI.wechat ? Object.keys(window.electronAPI.wechat) : []
        }
    }""")
    print(result)
    
    # 尝试调用 API
    if result.get('exists') and result.get('hasWechat'):
        print("\n" + "=" * 60)
        print("🧪 测试调用 window.electronAPI.wechat.getSessions():")
        print("=" * 60)
        try:
            sessions = page.evaluate("async () => await window.electronAPI.wechat.getSessions(3)")
            print(f"✅ 成功获取 {len(sessions) if isinstance(sessions, list) else '非列表'} 条数据")
            print(sessions[:2] if isinstance(sessions, list) else sessions)
        except Exception as e:
            print(f"❌ 调用失败: {e}")
    
    # 截图
    page.screenshot(path='/tmp/test_wechat.png', full_page=True)
    print("\n📸 截图已保存到 /tmp/test_wechat.png")
    
    browser.close()
    print("\n✅ 测试完成!")
