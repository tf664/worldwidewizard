export type Position = 'top' | 'bottom' | 'left' | 'right';
export type ArrowDirection = 'top' | 'bottom' | 'left' | 'right';

export interface InterfacePosition {
    x: string;
    y: string;
    transformX: string;
    transformY: string;
    arrowDir: ArrowDirection;
    position: Position;
}

export interface PlayerBounds {
    rect: DOMRect;
    position: Position;
    index: number;
}

export function calculateOptimalPosition(
    playerBounds: PlayerBounds,
    panelWidth: number,
    panelHeight: number,
    windowWidth: number,
    windowHeight: number,
    margin: number = 20
): InterfacePosition {
    const { rect, position } = playerBounds;

    // Priority order for positioning based on player's circular position
    const positionPriorities: Record<Position, Position[]> = {
        'bottom': ['right', 'left', 'top', 'bottom'],
        'top': ['left', 'right', 'bottom', 'top'],
        'left': ['bottom', 'top', 'right', 'left'],
        'right': ['top', 'bottom', 'left', 'right']
    };

    const priorities = positionPriorities[position];

    for (const targetPosition of priorities) {
        const pos = calculatePositionForSide(
            rect, targetPosition, panelWidth, panelHeight, margin
        );

        if (isPositionValid(pos, panelWidth, panelHeight, windowWidth, windowHeight)) {
            return {
                ...pos,
                position: targetPosition,
                arrowDir: getArrowDirection(targetPosition)
            };
        }
    }

    // Fallback to center with adaptive sizing
    return getCenterPosition(panelWidth, panelHeight, windowWidth, windowHeight);
}

function calculatePositionForSide(
    rect: DOMRect,
    side: Position,
    panelWidth: number,
    panelHeight: number,
    margin: number
): Pick<InterfacePosition, 'x' | 'y' | 'transformX' | 'transformY'> {
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

function isPositionValid(
    pos: Pick<InterfacePosition, 'x' | 'y' | 'transformX' | 'transformY'>,
    panelWidth: number,
    panelHeight: number,
    windowWidth: number,
    windowHeight: number
): boolean {
    const x = parseFloat(pos.x);
    const y = parseFloat(pos.y);

    let finalX: number, finalY: number;

    // Calculate final position based on transform
    if (pos.transformX === '-50%') {
        finalX = x - panelWidth / 2;
    } else if (pos.transformX === '-100%') {
        finalX = x - panelWidth;
    } else {
        finalX = x;
    }

    if (pos.transformY === '-50%') {
        finalY = y - panelHeight / 2;
    } else if (pos.transformY === '-100%') {
        finalY = y - panelHeight;
    } else {
        finalY = y;
    }

    return finalX >= 0 && finalY >= 0 &&
        finalX + panelWidth <= windowWidth &&
        finalY + panelHeight <= windowHeight;
}

function getArrowDirection(position: Position): ArrowDirection {
    const opposites: Record<Position, ArrowDirection> = {
        'right': 'left',
        'left': 'right',
        'bottom': 'top',
        'top': 'bottom'
    };
    return opposites[position];
}

function getCenterPosition(
    panelWidth: number,
    panelHeight: number,
    windowWidth: number,
    windowHeight: number
): InterfacePosition {
    // Scale down panel if it doesn't fit
    const maxWidth = windowWidth * 0.9;
    const maxHeight = windowHeight * 0.9;

    return {
        x: '50%',
        y: '50%',
        transformX: '-50%',
        transformY: '-50%',
        arrowDir: 'bottom',
        position: 'bottom'
    };
}