import { Component, ElementRef, HostListener, inject, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TeamFormModalComponent } from '../team-form-modal/team-form-modal.component';

interface SportEvent {
  date: string;
  title: string;
  description: string;
  location: string;
}

interface Team {
  logo: string;
  name: string;
  sport: string;
}

interface Result {
  teams: string;
  date: string;
  score: string;
}

interface SportCategory {
  logo: string;
  name: string;
  sport: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {

  private particleInterval: any;
  readonly dialog = inject(MatDialog);

  // Calendar properties
  currentDate = new Date();
  currentMonth = this.currentDate.getMonth();
  currentYear = this.currentDate.getFullYear();
  eventDays = [8, 15, 22, 30]; // Days with events in June
  dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

  // Data properties
  upcomingEvents: SportEvent[] = [
    {
      date: 'June 15, 2025',
      title: 'Championship Finals',
      description: 'The ultimate showdown between the top two teams of the season. Don\'t miss this thrilling match!',
      location: 'Central Sports Arena'
    },
    {
      date: 'June 22, 2025',
      title: 'Summer League Kickoff',
      description: 'Start of the exciting summer league with 16 teams competing for glory.',
      location: 'Riverside Stadium'
    },
    {
      date: 'June 30, 2025',
      title: 'Youth Tournament',
      description: 'Young talents showcase their skills in this competitive youth tournament.',
      location: 'Community Sports Center'
    }
  ];

  pastEvents: SportEvent[] = [
    {
      date: 'May 28, 2025',
      title: 'Spring Championship',
      description: 'An amazing tournament that saw record-breaking performances and unforgettable moments.',
      location: 'Olympic Stadium'
    },
    {
      date: 'May 15, 2025',
      title: 'Regional Qualifiers',
      description: 'Teams battled for their spot in the championship with incredible displays of skill.',
      location: 'Sports Complex North'
    }
  ];

  teams: Team[] = [
    { logo: 'TH', name: 'Thunder Hawks', sport: 'Basketball' },
    { logo: 'FE', name: 'Fire Eagles', sport: 'Football' },
    { logo: 'SS', name: 'Storm Sharks', sport: 'Swimming' },
    { logo: 'GL', name: 'Green Lions', sport: 'Soccer' },
    { logo: 'SW', name: 'Silver Wolves', sport: 'Hockey' },
    { logo: 'GR', name: 'Golden Raptors', sport: 'Tennis' }
  ];

  results: Result[] = [
    { teams: 'Thunder Hawks vs Fire Eagles', date: 'June 5, 2025', score: '89-76' },
    { teams: 'Green Lions vs Silver Wolves', date: 'June 3, 2025', score: '3-1' },
    { teams: 'Storm Sharks vs Golden Raptors', date: 'June 1, 2025', score: '2-0' },
    { teams: 'Fire Eagles vs Green Lions', date: 'May 30, 2025', score: '4-2' }
  ];

  sportsCategories: SportCategory[] = [
    { logo: '🏀', name: 'Basketball', sport: 'Fast-paced court action' },
    { logo: '⚽', name: 'Soccer', sport: 'The beautiful game' },
    { logo: '🏈', name: 'Football', sport: 'American football' },
    { logo: '🏊', name: 'Swimming', sport: 'Aquatic excellence' },
    { logo: '🏒', name: 'Hockey', sport: 'Ice hockey thrills' },
    { logo: '🎾', name: 'Tennis', sport: 'Precision and power' }
  ];

  constructor(private elementRef: ElementRef, private renderer: Renderer2) {}

  ngOnInit() {
    this.handleScrollAnimations();
    this.startParticleAnimation();
    this.setupInteractiveEffects();
    
    // Initial scroll animation check
    setTimeout(() => {
      this.handleScrollAnimations();
    }, 100);
  }

  ngOnDestroy() {
    if (this.particleInterval) {
      clearInterval(this.particleInterval);
    }
  }

  openDialog() {
    const dialogRef = this.dialog.open(TeamFormModalComponent);

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    this.handleScrollAnimations();
    this.handleHeaderScroll();
    this.handleParallax();
  }

  // Calendar methods
  getCurrentMonthYear(): string {
    return `${this.monthNames[this.currentMonth]} ${this.currentYear}`;
  }

  getEmptyDays(): number[] {
    const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
    return Array(firstDay).fill(0);
  }

  getDaysInMonth(): number[] {
    const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  }

  changeMonth(direction: number) {
    this.currentMonth += direction;
    if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else if (this.currentMonth < 0) {
      this.currentMonth = 11;
      this.currentYear--;
    }
  }

  isToday(day: number): boolean {
    const today = new Date();
    return day === today.getDate() && 
           this.currentMonth === today.getMonth() && 
           this.currentYear === today.getFullYear();
  }

  hasEvent(day: number): boolean {
    return this.currentMonth === 5 && // June
           this.currentYear === 2025 && 
           this.eventDays.includes(day);
  }

  onDayClick(day: number) {
    if (this.hasEvent(day)) {
      this.showEventNotification(day);
    }
  }

  // Scroll and animation methods
  scrollToSection(event: MouseEvent, sectionId: string) {
    event.preventDefault();
    const target = document.getElementById(sectionId);
    if (target) {
      const headerHeight = 80;
      const targetPosition = target.offsetTop - headerHeight;
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  }

  private handleScrollAnimations() {
    const elements = this.elementRef.nativeElement.querySelectorAll('.fade-in');
    elements.forEach((element: HTMLElement) => {
      const elementTop = element.getBoundingClientRect().top;
      const elementVisible = 150;
      
      if (elementTop < window.innerHeight - elementVisible) {
        this.renderer.addClass(element, 'visible');
      }
    });
  }

  private handleHeaderScroll() {
    const header = this.elementRef.nativeElement.querySelector('header');
    if (header) {
      if (window.scrollY > 100) {
        this.renderer.setStyle(header, 'background', 'rgba(255, 255, 255, 0.95)');
        this.renderer.setStyle(header, 'backdrop-filter', 'blur(20px)');
      } else {
        this.renderer.setStyle(header, 'background', 'linear-gradient(135deg, #ffffff 0%, #f0f9f0 100%)');
        this.renderer.setStyle(header, 'backdrop-filter', 'blur(10px)');
      }
    }
  }

  private handleParallax() {
    const scrolled = window.pageYOffset;
    const hero = this.elementRef.nativeElement.querySelector('.hero');
    if (hero) {
      this.renderer.setStyle(hero, 'transform', `translateY(${scrolled * 0.5}px)`);
    }
  }

  private setupInteractiveEffects() {
    // Add hover effects to cards
    const cards = this.elementRef.nativeElement.querySelectorAll('.event-card, .team-card, .result-item');
    cards.forEach((card: HTMLElement) => {
      this.renderer.listen(card, 'mouseenter', () => {
        const transform = card.classList.contains('result-item') ? 
          'translateX(15px) scale(1.02)' : 'translateY(-15px) scale(1.02)';
        this.renderer.setStyle(card, 'transform', transform);
      });
      
      this.renderer.listen(card, 'mouseleave', () => {
        const transform = card.classList.contains('result-item') ? 
          'translateX(0) scale(1)' : 'translateY(0) scale(1)';
        this.renderer.setStyle(card, 'transform', transform);
      });
    });

    // Add CTA button animation
    const ctaButton = this.elementRef.nativeElement.querySelector('.cta-button');
    if (ctaButton) {
      this.renderer.listen(ctaButton, 'click', (e) => {
        this.renderer.setStyle(ctaButton, 'transform', 'scale(0.95)');
        setTimeout(() => {
          this.renderer.setStyle(ctaButton, 'transform', 'translateY(-5px) scale(1.05)');
        }, 100);
      });
    }
  }

  private showEventNotification(day: number) {
    const notification = this.renderer.createElement('div');
    this.renderer.setProperty(notification, 'textContent', `Event scheduled on ${day}!`);
    
    const notificationStyles = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(45deg, #228B22, #32CD32);
      color: white;
      padding: 15px 25px;
      border-radius: 10px;
      box-shadow: 0 10px 30px rgba(34, 139, 34, 0.3);
      z-index: 10000;
      font-weight: bold;
      animation: slideIn 0.3s ease-out;
    `;
    
    this.renderer.setAttribute(notification, 'style', notificationStyles);
    
    // Add slide-in animation
    const style = this.renderer.createElement('style');
    this.renderer.setProperty(style, 'textContent', `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `);
    
    this.renderer.appendChild(document.head, style);
    this.renderer.appendChild(document.body, notification);
    
    setTimeout(() => {
      this.renderer.removeChild(document.body, notification);
      this.renderer.removeChild(document.head, style);
    }, 3000);
  }

  private startParticleAnimation() {
    this.particleInterval = setInterval(() => {
      this.createParticle();
    }, 2000);
  }

  private createParticle() {
    const particle = this.renderer.createElement('div');
    
    const particleStyles = `
      position: fixed;
      width: 4px;
      height: 4px;
      background: linear-gradient(45deg, #228B22, #32CD32);
      border-radius: 50%;
      pointer-events: none;
      z-index: -1;
      opacity: 0.6;
      left: ${Math.random() * window.innerWidth}px;
      top: ${window.innerHeight}px;
    `;
    
    this.renderer.setAttribute(particle, 'style', particleStyles);
    this.renderer.appendChild(document.body, particle);
    
    // Animate particle
    const keyframes = [
      { transform: 'translateY(0px)', opacity: '0.6' },
      { transform: `translateY(-${window.innerHeight + 100}px)`, opacity: '0' }
    ];
    
    const options = {
      duration: Math.random() * 3000 + 2000,
      easing: 'linear'
    };
    
    const animation = particle.animate(keyframes, options);
    
    animation.addEventListener('finish', () => {
      this.renderer.removeChild(document.body, particle);
    });
  }
}