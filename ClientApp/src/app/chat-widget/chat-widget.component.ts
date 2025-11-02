import { Component } from '@angular/core';
import { MedicineService } from '../medicine/medicine.service';

type ChatMessage = {
  sender: 'Levi' | 'You';
  text: string;
  timestamp: Date;
};

type I18nKey =
  | 'fabTooltip'
  | 'initialGreeting'
  | 'inputPlaceholder'
  | 'send'
  | 'stock_none'
  | 'stock_current'
  | 'stock_no_match'
  | 'stock_error'
  | 'jewel_info'
  | 'creator_info'
  | 'medicine_help'
  | 'patient_help'
  | 'supplier_help'
  | 'support'
  | 'generic_help'
  | 'quick_1'
  | 'quick_2'
  | 'quick_3'
  | 'quick_4'
  | 'buyCoffee';

@Component({
  selector: 'app-chat-widget',
  templateUrl: './chat-widget.component.html',
  styleUrls: ['./chat-widget.component.scss']
})
export class ChatWidgetComponent {
  isOpen = false;
  inputText = '';
  messages: ChatMessage[] = [
    { sender: 'Levi', text: 'Hello! Can I help you?', timestamp: new Date() }
  ];
  isTyping = false;
  showQRModal = false;

  selectedLanguage: string = 'en';
  languages = [
    { code: 'en', label: 'English' },
    { code: 'tl', label: 'Tagalog' },
    { code: 'ko', label: 'Korean' },
    { code: 'zh', label: 'Chinese' }
  ];

  i18n: Record<I18nKey, Record<string, string>> = {
    fabTooltip: {
      en: 'Chat with Levi',
      tl: 'Makipag-usap kay Levi',
      ko: 'Levi와 채팅',
      zh: '与Levi聊天'
    },
    initialGreeting: {
      en: 'Hello! Can I help you?',
      tl: 'Kumusta! Makatutulong ba ako?',
      ko: '안녕하세요! 도와드릴까요?',
      zh: '你好！我能帮你吗？'
    },
    inputPlaceholder: {
      en: 'Type your message...',
      tl: 'I-type ang iyong mensahe...',
      ko: '메시지를 입력하세요...',
      zh: '输入您的消息...'
    },
    send: {
      en: 'Send',
      tl: 'Ipadala',
      ko: '전송',
      zh: '发送'
    },
    stock_none: {
      en: 'I could not find any medicines right now.',
      tl: 'Hindi ko mahanap ang anumang gamot ngayon.',
      ko: '지금 약을 찾을 수 없습니다.',
      zh: '我现在找不到任何药物。'
    },
    stock_current: {
      en: 'Current stock for {name} is {stock}.',
      tl: 'Ang kasalukuyang stock para sa {name} ay {stock}.',
      ko: '{name}의 현재 재고는 {stock}입니다.',
      zh: '{name}的当前库存是{stock}。'
    },
    stock_no_match: {
      en: 'I couldn\'t find a medicine named "{query}" in the list.',
      tl: 'Hindi ko mahanap ang isang gamot na may pangalang "{query}" sa listahan.',
      ko: '목록에서 "{query}"라는 이름의 약을 찾을 수 없습니다.',
      zh: '我在列表中找不到名为"{query}"的药物。'
    },
    stock_error: {
      en: 'Sorry, I could not retrieve medicines right now.',
      tl: 'Paumanhin, hindi ko makuha ang mga gamot ngayon.',
      ko: '죄송합니다. 지금 약을 검색할 수 없습니다.',
      zh: '抱歉，我现在无法检索药物。'
    },
    jewel_info: {
      en: 'Jewel is the founder and UI/UX designer of InventoRx, leading the product vision and crafting delightful user experiences.',
      tl: 'Si Jewel ang tagapagtatag at UI/UX designer ng InventoRx, na namumuno sa product vision at gumagawa ng kasiya-siyang user experience.',
      ko: 'Jewel은 InventoRx의 창립자이자 UI/UX 디자이너로, 제품 비전을 이끌고 즐거운 사용자 경험을 만듭니다.',
      zh: 'Jewel是InventoRx的创始人和UI/UX设计师，领导产品愿景并创造令人愉悦的用户体验。'
    },
    creator_info: {
      en: 'Ivan is the Full Stack Software Engineer and Jewel is the UI/UX designer of this app, and founder/creator of InventoRx.',
      tl: 'Si Ivan ang Full Stack Software Engineer at si Jewel ang UI/UX designer ng app na ito, at founder/creator ng InventoRx.',
      ko: 'Ivan은 풀스택 소프트웨어 엔지니어이고 Jewel은 이 앱의 UI/UX 디자이너이며 InventoRx의 창립자/제작자입니다.',
      zh: 'Ivan是全栈软件工程师，Jewel是此应用程序的UI/UX设计师，也是InventoRx的创始人/创建者。'
    },
    medicine_help: {
      en: 'To add medicine, click Add Medicine on the Medicines page and fill the form.',
      tl: 'Upang magdagdag ng gamot, i-click ang Add Medicine sa pahina ng Medicines at punan ang form.',
      ko: '약을 추가하려면 약품 페이지에서 약 추가를 클릭하고 양식을 작성하세요.',
      zh: '要添加药物，请在药物页面上单击添加药物并填写表格。'
    },
    patient_help: {
      en: 'Use the Patient page: Add/Admit via the Add Patient modal; Discharge via the action button.',
      tl: 'Gamitin ang pahina ng Patient: Magdagdag/Admit sa pamamagitan ng Add Patient modal; Discharge sa pamamagitan ng action button.',
      ko: '환자 페이지를 사용하세요: 환자 추가 모달을 통해 추가/입원; 작업 버튼을 통해 퇴원.',
      zh: '使用患者页面：通过添加患者模态框添加/入院；通过操作按钮出院。'
    },
    supplier_help: {
      en: 'Open Add Supplier from the medicine modal to register a consignor.',
      tl: 'Buksan ang Add Supplier mula sa medicine modal upang magrehistro ng consignor.',
      ko: '의약품 모달에서 공급자 추가를 열어 수탁자를 등록하세요.',
      zh: '从药物模态框打开添加供应商以注册委托方。'
    },
    support: {
      en: 'You can email support at inventorx@yopmail.com.',
      tl: 'Maaari kang mag-email sa support sa inventorx@yopmail.com.',
      ko: 'support@inventorx.com으로 지원팀에 이메일을 보낼 수 있습니다.',
      zh: '您可以向inventorx@yopmail.com发送电子邮件支持。'
    },
    generic_help: {
      en: 'I\'m here to help. Try asking about medicines, patients, or suppliers.',
      tl: 'Narito ako upang tumulong. Subukan na magtanong tungkol sa mga gamot, pasyente, o supplier.',
      ko: '도움을 드리기 위해 여기 있습니다. 약품, 환자 또는 공급자에 대해 물어보세요.',
      zh: '我在这里帮助您。尝试询问有关药物、患者或供应商的问题。'
    },
    quick_1: {
      en: 'How to add medicine?',
      tl: 'Paano magdagdag ng gamot?',
      ko: '약을 추가하는 방법은?',
      zh: '如何添加药物？'
    },
    quick_2: {
      en: 'How to admit/discharge patient?',
      tl: 'Paano mag-admit/discharge ng pasyente?',
      ko: '환자를 입원/퇴원하는 방법은?',
      zh: '如何入院/出院患者？'
    },
    quick_3: {
      en: 'How to add supplier?',
      tl: 'Paano magdagdag ng supplier?',
      ko: '공급자를 추가하는 방법은?',
      zh: '如何添加供应商？'
    },
    quick_4: {
      en: 'Contact support',
      tl: 'Makipag-ugnayan sa support',
      ko: '지원팀 연락',
      zh: '联系支持'
    },
    buyCoffee: {
      en: 'Buy me a coffee',
      tl: 'Bumili ng kape',
      ko: '커피 사주기',
      zh: '请我喝咖啡'
    }
  };

  quickReplies: string[] = [
    this.tr('quick_1'),
    this.tr('quick_2'),
    this.tr('quick_3'),
    this.tr('quick_4')
  ];

  constructor(private medicineService: MedicineService) {
    // Load saved language preference
    const savedLang = localStorage.getItem('chatLanguage');
    if (savedLang) {
      this.selectedLanguage = savedLang;
    }
    this.updateQuickReplies();
  }

  tr(key: I18nKey): string {
    return this.i18n[key]?.[this.selectedLanguage] || this.i18n[key]?.['en'] || key;
  }

  fmt(key: I18nKey, params: Record<string, string>): string {
    let text = this.tr(key);
    Object.keys(params).forEach(k => {
      text = text.replace(`{${k}}`, params[k]);
    });
    return text;
  }

  onLanguageChange(lang: string): void {
    this.selectedLanguage = lang;
    localStorage.setItem('chatLanguage', lang);
    this.updateQuickReplies();
  }

  private updateQuickReplies(): void {
    this.quickReplies = [
      this.tr('quick_1'),
      this.tr('quick_2'),
      this.tr('quick_3'),
      this.tr('quick_4')
    ];
  }

  toggle(): void {
    this.isOpen = !this.isOpen;
  }

  send(text?: string): void {
    const content = (text ?? this.inputText).trim();
    if (!content) return;

    this.pushUser(content);
    this.inputText = '';
    this.autoRespond(content);
  }

  selectQuickReply(reply: string): void {
    this.send(reply);
  }

  openBuyMeACoffee(): void {
    this.showQRModal = true;
  }

  closeQRModal(): void {
    this.showQRModal = false;
  }

  private pushUser(text: string): void {
    this.messages.push({ sender: 'You', text, timestamp: new Date() });
    setTimeout(() => this.scrollToBottom(), 0);
  }

  private pushLevi(text: string): void {
    this.messages.push({ sender: 'Levi', text, timestamp: new Date() });
    setTimeout(() => this.scrollToBottom(), 0);
  }

  private autoRespond(userText: string): void {
    const t = userText.toLowerCase();

    // Stock query: "How many stock of <medicine>?"
    const stockMatch = /how\s+many\s+stock\s+of\s+(.+?)\??$/i.exec(userText.trim());
    if (stockMatch && stockMatch[1]) {
      const queryName = stockMatch[1].trim();
      this.isTyping = true;
      this.medicineService.getMedicine().subscribe({
        next: (list) => {
          if (!Array.isArray(list) || list.length === 0) {
            this.pushLevi(this.tr('stock_none'));
            this.isTyping = false;
            return;
          }
          const q = queryName.toLowerCase();
          // Prefer exact name match, otherwise fallback to includes
          let found = list.find((m: any) => (m.genericName || '').toLowerCase() === q);
          if (!found) {
            found = list.find((m: any) => (m.genericName || '').toLowerCase().includes(q));
          }
          if (found) {
            const name = found.genericName || queryName;
            const stock = typeof found.stock === 'number' ? found.stock : 'unknown';
            this.pushLevi(this.fmt('stock_current', { name, stock: String(stock) }));
          } else {
            this.pushLevi(this.fmt('stock_no_match', { query: queryName }));
          }
          this.isTyping = false;
        },
        error: () => {
          this.pushLevi(this.tr('stock_error'));
          this.isTyping = false;
        }
      });
      return;
    }

    if (t.includes('jewel')) {
      this.typing(() => this.pushLevi(this.tr('jewel_info')));
      return;
    }

    // Creator question variants
    if (/who\s+is\s+creator\s+of\s+this\s+app\??/i.test(userText) || /who\s+is\s+create\s+of\s+this\s+app\??/i.test(userText)) {
      this.typing(() => this.pushLevi(this.tr('creator_info')));
      return;
    }

    // Very simple keyword routing
    if (t.includes('medicine')) {
      this.typing(() => this.pushLevi(this.tr('medicine_help')));
      return;
    }
    if (t.includes('admit') || t.includes('discharge') || t.includes('patient')) {
      this.typing(() => this.pushLevi(this.tr('patient_help')));
      return;
    }
    if (t.includes('supplier')) {
      this.typing(() => this.pushLevi(this.tr('supplier_help')));
      return;
    }
    if (t.includes('support') || t.includes('contact')) {
      this.typing(() => this.pushLevi(this.tr('support')));
      return;
    }

    this.typing(() => this.pushLevi(this.tr('generic_help')));
  }

  private typing(action: () => void): void {
    // Simulate typing delay
    this.isTyping = true;
    setTimeout(() => {
      action();
      this.isTyping = false;
    }, 600);
  }

  private scrollToBottom(): void {
    const el = document.querySelector('.chat-messages');
    if (el) el.scrollTop = el.scrollHeight;
  }
}
