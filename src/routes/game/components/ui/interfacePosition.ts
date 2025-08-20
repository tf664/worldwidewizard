export type Position = 'top' | 'bottom' | 'left' | 'right';

export interface PanelPosition {
    x: string;
    y: string;
    transformX: string;
    transformY: string;
    position: Position;
}

export class PanelPositionManager {
    private playerPositions: Map<number, PanelPosition> = new Map();
    private lastWindowSize = { width: 0, height: 0 };
    private lastOrientation = 0;
    private panelDimensions = { width: 384, height: 400 };

    constructor(private minMobileWidth = 768) { }

    /**
     * Initialize positions using real player DOM elements
     */
    initializePositionsFromDOM(
        playerElements: HTMLElement[],
        windowWidth: number,
        windowHeight: number,
        panelScale: number = 0.8
    ): void {
        this.panelDimensions = {
            width: 384 * panelScale,
            height: 400 * panelScale
        };

        // Clear existing positions
        this.playerPositions.clear();
        this.lastWindowSize = { width: windowWidth, height: windowHeight };
        this.lastOrientation = screen.orientation?.angle || 0;

        // Mobile fallback - all players use center position
        if (this.isMobileScreen(windowWidth, windowHeight)) {
            for (let i = 0; i < playerElements.length; i++) {
                this.playerPositions.set(i, this.getMobileFallbackPosition());
            }
            return;
        }

        // Calculate positions for each player using real DOM positions
        playerElements.forEach((element, index) => {
            if (element) {
                const rect = element.getBoundingClientRect();
                const position = this.calculateOptimalPosition(
                    rect,
                    windowWidth,
                    windowHeight,
                    40 // safe zone margin
                );
                this.playerPositions.set(index, position);
            }
        });
    }

    /**
     * Legacy method for backward compatibility
     */
    initializePositions(
        playerCount: number,
        windowWidth: number,
        windowHeight: number,
        panelScale: number = 0.8
    ): void {
        // Fallback to center position for all players when DOM elements aren't available
        this.panelDimensions = {
            width: 384 * panelScale,
            height: 400 * panelScale
        };

        this.playerPositions.clear();
        this.lastWindowSize = { width: windowWidth, height: windowHeight };
        this.lastOrientation = screen.orientation?.angle || 0;

        const fallbackPosition = this.isMobileScreen(windowWidth, windowHeight)
            ? this.getMobileFallbackPosition()
            : this.getAdaptiveCenterPosition(windowWidth, windowHeight);

        for (let i = 0; i < playerCount; i++) {
            this.playerPositions.set(i, fallbackPosition);
        }
    }

    /**
     * Get position for a specific player
     */
    getPlayerPosition(playerId: number): PanelPosition {
        return this.playerPositions.get(playerId) || this.getMobileFallbackPosition();
    }

    /**
     * Check if positions need recalculation
     */
    shouldRecalculate(windowWidth: number, windowHeight: number): boolean {
        const currentOrientation = screen.orientation?.angle || 0;
        const sizeChanged = Math.abs(this.lastWindowSize.width - windowWidth) > 50 ||
            Math.abs(this.lastWindowSize.height - windowHeight) > 50;
        const orientationChanged = this.lastOrientation !== currentOrientation;

        return sizeChanged || orientationChanged;
    }

    private calculateOptimalPosition(
        playerRect: DOMRect,
        windowWidth: number,
        windowHeight: number,
        margin: number
    ): PanelPosition {
        // Calculate distances to each side
        const distances = {
            right: windowWidth - playerRect.right,
            left: playerRect.left,
            bottom: windowHeight - playerRect.bottom,
            top: playerRect.top
        };

        // Try positions in order of available space
        const positionsBySpace = Object.entries(distances)
            .sort(([, a], [, b]) => b - a)
            .map(([pos]) => pos as Position);

        // Try each position and use the first valid one
        for (const targetPosition of positionsBySpace) {
            const candidate = this.calculatePositionForSide(
                playerRect,
                targetPosition,
                margin
            );

            if (this.isPositionValid(candidate, windowWidth, windowHeight, margin)) {
                return {
                    ...candidate,
                    position: targetPosition,
                };
            }
        }

        // Fallback to adaptive center position
        return this.getAdaptiveCenterPosition(windowWidth, windowHeight);
    }

    private calculatePositionForSide(
        rect: DOMRect,
        side: Position,
        margin: number
    ): Omit<PanelPosition, 'position' | 'arrowDir'> {
        switch (side) {
            case 'right':
                return {
                    x: `${rect.right + margin}px`,
                    y: `${rect.top + rect.height / 2}px`,
                    transformX: '0%',
                    transformY: '-50%'
                };
            case 'left':
                return {
                    x: `${rect.left - margin}px`,
                    y: `${rect.top + rect.height / 2}px`,
                    transformX: '-100%',
                    transformY: '-50%'
                };
            case 'bottom':
                return {
                    x: `${rect.left + rect.width / 2}px`,
                    y: `${rect.bottom + margin}px`,
                    transformX: '-50%',
                    transformY: '0%'
                };
            case 'top':
                return {
                    x: `${rect.left + rect.width / 2}px`,
                    y: `${rect.top - margin}px`,
                    transformX: '-50%',
                    transformY: '-100%'
                };
        }
    }

    private isPositionValid(
        pos: Omit<PanelPosition, 'position' | 'arrowDir'>,
        windowWidth: number,
        windowHeight: number,
        safeZone: number
    ): boolean {
        const x = parseFloat(pos.x);
        const y = parseFloat(pos.y);

        // Calculate final position after transform
        let finalX = x;
        let finalY = y;

        if (pos.transformX === '-50%') finalX = x - this.panelDimensions.width / 2;
        else if (pos.transformX === '-100%') finalX = x - this.panelDimensions.width;

        if (pos.transformY === '-50%') finalY = y - this.panelDimensions.height / 2;
        else if (pos.transformY === '-100%') finalY = y - this.panelDimensions.height;

        return finalX >= safeZone &&
            finalY >= safeZone &&
            finalX + this.panelDimensions.width <= windowWidth - safeZone &&
            finalY + this.panelDimensions.height <= windowHeight - safeZone;
    }

    private isMobileScreen(width: number, height: number): boolean {
        return width < this.minMobileWidth || height < 600 ||
            (Math.min(width, height) < 500);
    }

    private getMobileFallbackPosition(): PanelPosition {
        return {
            x: '50%',
            y: '85%',
            transformX: '-50%',
            transformY: '-100%',
            position: 'bottom'
        };
    }

    private getAdaptiveCenterPosition(windowWidth: number, windowHeight: number): PanelPosition {
        const centerY = windowHeight > 600 ? '50%' : '60%';

        return {
            x: '50%',
            y: centerY,
            transformX: '-50%',
            transformY: '-50%',
            position: 'bottom'
        };
    }
}