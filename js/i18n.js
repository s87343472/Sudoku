class I18nManager {
    constructor() {
        this.currentLang = localStorage.getItem('sudoku_lang') || 'en';
        this.translations = {};
        this.observers = [];
    }

    // 初始化
    async init() {
        // 加载语言包
        await this.loadTranslations();
        // 添加语言切换器
        this.addLanguageSelector();
        // 首次翻译
        this.translatePage();
    }

    // 加载语言包
    async loadTranslations() {
        const langs = ['en', 'zh'];
        for (const lang of langs) {
            const script = document.createElement('script');
            script.src = `js/i18n/${lang}.js`;
            document.head.appendChild(script);
            await new Promise(resolve => script.onload = resolve);
            this.translations[lang] = window.i18n[lang];
        }
    }

    // 添加语言切换器
    addLanguageSelector() {
        const container = document.createElement('div');
        container.className = 'language-selector';
        container.innerHTML = `
            <select id="language-select">
                <option value="en">English</option>
                <option value="zh">中文</option>
            </select>
        `;
        
        // 插入到页脚的语言选择器容器中
        const selectorContainer = document.querySelector('.language-selector-container');
        if (selectorContainer) {
            selectorContainer.appendChild(container);
        }

        // 设置当前语言
        const select = container.querySelector('select');
        select.value = this.currentLang;

        // 监听语言切换
        select.addEventListener('change', (e) => {
            this.setLanguage(e.target.value);
        });
    }

    // 设置语言
    setLanguage(lang) {
        this.currentLang = lang;
        localStorage.setItem('sudoku_lang', lang);
        this.translatePage();
        // 通知观察者
        this.notifyObservers();
    }

    // 翻译页面
    translatePage() {
        const translate = (element) => {
            const key = element.getAttribute('data-i18n');
            if (!key) return;

            const text = this.getTranslation(key);
            if (text) {
                if (element.tagName === 'INPUT' && element.type === 'submit') {
                    element.value = text;
                } else {
                    element.textContent = text;
                }
            }
        };

        // 翻译所有带有 data-i18n 属性的元素
        document.querySelectorAll('[data-i18n]').forEach(translate);
    }

    // 获取翻译
    getTranslation(key) {
        const keys = key.split('.');
        let value = this.translations[this.currentLang];
        for (const k of keys) {
            if (!value) return null;
            value = value[k];
        }
        return value;
    }

    // 添加观察者
    addObserver(callback) {
        this.observers.push(callback);
    }

    // 通知观察者
    notifyObservers() {
        this.observers.forEach(callback => callback(this.currentLang));
    }
}

// 在页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    window.i18nManager = new I18nManager();
    window.i18nManager.init();
});
