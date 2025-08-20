export class CardImagePreloader {
    private static instance: CardImagePreloader;
    private preloadedImages: Map<string, HTMLImageElement> = new Map();
    private preloadPromise: Promise<void> | null = null;

    private constructor() {}

    static getInstance(): CardImagePreloader {
        if (!CardImagePreloader.instance) {
            CardImagePreloader.instance = new CardImagePreloader();
        }
        return CardImagePreloader.instance;
    }

    async preloadAllCards(): Promise<void> {
        if (this.preloadPromise) {
            return this.preloadPromise;
        }

        this.preloadPromise = this.doPreload();
        return this.preloadPromise;
    }

    private async doPreload(): Promise<void> {
        const cardPaths = this.generateAllCardPaths();
        console.log(`Preloading ${cardPaths.length} card images...`);
        
        // Load images in smaller batches to avoid overwhelming the browser
        const batchSize = 5;
        for (let i = 0; i < cardPaths.length; i += batchSize) {
            const batch = cardPaths.slice(i, i + batchSize);
            const batchPromises = batch.map(path => this.preloadImage(path));
            
            try {
                await Promise.all(batchPromises);
                console.log(`Loaded batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(cardPaths.length/batchSize)}`);
            } catch (error) {
                console.warn(`Error loading batch starting at index ${i}:`, error);
            }
        }
        
        console.log('Card image preloading completed!');
    }

    private generateAllCardPaths(): string[] {
        const paths: string[] = [];
        
        // Regular cards - EXACTLY matching your server's suits
        const suits = ['blue', 'red', 'green', 'yellow'];
        const rankNames = [
            '', 'one', 'two', 'three', 'four', 'five', 'six',
            'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen'
        ];

        suits.forEach(suit => {
            for (let i = 1; i <= 13; i++) {
                paths.push(`/rcs/cards-optimized/${suit}_${rankNames[i]}.webp`);
            }
        });

        // Special cards - exactly as used in your components
        const specialNumbers = ['one', 'two', 'three', 'four'];
        specialNumbers.forEach(num => {
            paths.push(`/rcs/cards-optimized/zoro_${num}.webp`);
            paths.push(`/rcs/cards-optimized/fool_${num}.webp`);
        });

        return paths;
    }

    private preloadImage(src: string): Promise<HTMLImageElement> {
        return new Promise((resolve) => {
            if (this.preloadedImages.has(src)) {
                resolve(this.preloadedImages.get(src)!);
                return;
            }

            const img = new Image();
            img.onload = () => {
                this.preloadedImages.set(src, img);
                resolve(img);
            };
            img.onerror = () => {
                console.warn(`Failed to preload image: ${src}`);
                // Resolve anyway to continue loading other images
                resolve(img);
            };
            img.src = src;
        });
    }

    getPreloadedImage(src: string): HTMLImageElement | null {
        return this.preloadedImages.get(src) || null;
    }

    isImagePreloaded(src: string): boolean {
        return this.preloadedImages.has(src);
    }
}

export const cardImagePreloader = CardImagePreloader.getInstance();