import { Injectable } from '@angular/core';

type OptionalString = string | undefined;

export interface GlobalLoadingCoverConfig
{
    backgroundColor?: string;
    spinnerTrackColor?: string;
    spinnerAccentColor?: string;
    navHeight?: string;
    heroMinHeight?: string;
    reserveHeroSpace?: boolean;
}

@Injectable({
    providedIn: 'root',
})
export class GlobalLoadingCover
{
    private static overlayElement: HTMLDivElement | null = null;
    private static reserveElement: HTMLDivElement | null = null;
    private static config: Required<GlobalLoadingCoverConfig> = {
        backgroundColor: '#040404',
        spinnerTrackColor: 'rgba(255,255,255,0.12)',
        spinnerAccentColor: '#ff3b30',
        navHeight: '4rem',
        heroMinHeight: '32rem',
        reserveHeroSpace: true,
    };
    private static stylesInjected = false;

    static init(config: GlobalLoadingCoverConfig): void
    {
        this.config = {
            ...this.config,
            ...config,
            reserveHeroSpace: config.reserveHeroSpace ?? this.config.reserveHeroSpace,
        };

        this.injectStyles();
        this.ensureCssVariables();
        this.ensureOverlayElement();
        this.ensureReserveElement();
    }

    static show(): void
    {
        const overlay = this.ensureOverlayElement();
        if (overlay)
        {
            overlay.style.opacity = '1';
            overlay.style.visibility = 'visible';
            overlay.style.pointerEvents = 'auto';
        }
    }

    static hide(): void
    {
        const overlay = this.overlayElement;
        if (!overlay)
        {
            return;
        }

        overlay.style.opacity = '0';
        overlay.style.pointerEvents = 'none';
        globalThis.setTimeout(() =>
        {
            if (overlay.style.opacity === '0')
            {
                overlay.style.visibility = 'hidden';
            }
        }, 300);
    }

    static hideReserve(): void
    {
        const reserve = this.reserveElement;
        if (!reserve)
        {
            return;
        }

        reserve.dataset.hidden = 'true';
        globalThis.setTimeout(() =>
        {
            reserve.style.display = 'none';
        }, 400);
    }

    show(): void
    {
        GlobalLoadingCover.show();
    }

    hide(): void
    {
        GlobalLoadingCover.hide();
    }

    hideReserve(): void
    {
        GlobalLoadingCover.hideReserve();
    }

    private static getDocument(): Document | null
    {
        return typeof document !== 'undefined' ? document : null;
    }

    private static ensureCssVariables(): void
    {
        const doc = this.getDocument();
        if (!doc)
        {
            return;
        }

        const root = doc.documentElement;
        root.style.setProperty('--nav-h', this.config.navHeight);
        root.style.setProperty('--hero-min-h', this.config.heroMinHeight);
    }

    private static ensureOverlayElement(): HTMLDivElement | null
    {
        if (this.overlayElement)
        {
            return this.overlayElement;
        }

        const doc = this.getDocument();
        if (!doc)
        {
            return null;
        }

        const overlay = doc.createElement('div');
        overlay.dataset.globalLoadingCover = 'true';
        overlay.setAttribute('role', 'status');
        overlay.setAttribute('aria-live', 'polite');
        overlay.style.position = 'fixed';
        overlay.style.inset = '0';
        overlay.style.zIndex = '9999';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.backgroundColor = this.config.backgroundColor;
        overlay.style.transition = 'opacity 0.3s ease, visibility 0.3s ease';
        overlay.style.opacity = '0';
        overlay.style.visibility = 'hidden';

        const spinner = this.createSpinnerElement(doc);
        overlay.appendChild(spinner);

        doc.body.appendChild(overlay);
        this.overlayElement = overlay;
        return overlay;
    }

    private static ensureReserveElement(): void
    {
        const doc = this.getDocument();
        if (!doc || !this.config.reserveHeroSpace)
        {
            return;
        }

        if (this.reserveElement)
        {
            this.reserveElement.style.display = 'block';
            return;
        }

        const reserve = doc.createElement('div');
        reserve.dataset.reserve = 'hero';
        reserve.setAttribute('aria-hidden', 'true');
        reserve.style.display = 'block';
        reserve.style.minHeight = this.config.heroMinHeight;
        reserve.style.width = '100%';
        reserve.style.transition = 'opacity 0.4s ease, max-height 0.4s ease';
        reserve.style.opacity = '1';
        reserve.style.maxHeight = this.config.heroMinHeight;

        const appRoot = doc.querySelector('app-root');
        if (appRoot)
        {
            doc.body.insertBefore(reserve, appRoot);
        } else
        {
            doc.body.prepend(reserve);
        }

        this.reserveElement = reserve;
    }

    private static createSpinnerElement(doc: Document): HTMLDivElement
    {
        const wrapper = doc.createElement('div');
        wrapper.classList.add('global-loading-cover-spinner');
        wrapper.style.width = '4rem';
        wrapper.style.height = '4rem';
        wrapper.style.borderRadius = '9999px';
        wrapper.style.border = `4px solid ${this.safeColor(this.config.spinnerTrackColor)}`;
        wrapper.style.borderTopColor = this.safeColor(this.config.spinnerAccentColor);
        wrapper.style.animation = 'global-loading-cover-spin 1s linear infinite';

        return wrapper;
    }

    private static injectStyles(): void
    {
        if (this.stylesInjected)
        {
            return;
        }
        const doc = this.getDocument();
        if (!doc)
        {
            return;
        }

        const style = doc.createElement('style');
        style.textContent = `
@keyframes global-loading-cover-spin {
    to {
        transform: rotate(360deg);
    }
}

[data-global-loading-cover="true"] {
    backdrop-filter: blur(4px);
}

[data-reserve="hero"][data-hidden="true"] {
    opacity: 0;
    max-height: 0 !important;
}
`;
        doc.head.appendChild(style);
        this.stylesInjected = true;
    }

    private static safeColor(color: OptionalString): string
    {
        return color ?? '#ffffff';
    }
}
