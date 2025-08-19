export type Position = 'top' | 'bottom' | 'left' | 'right';

export interface InterfacePos {
    x: number;
    y: number;
    position: Position;
    arrowX?: number;
    arrowY?: number;
}

export function canAttachToPlayer(
    playerRect: DOMRect,
    panelWidth: number,
    panelHeight: number,
    windowWidth: number,
    windowHeight: number,
    position: Position
): boolean {
    const margin = 12;
    if (position === 'top') return playerRect.top - panelHeight - margin > 0;
    if (position === 'bottom') return playerRect.bottom + panelHeight + margin < windowHeight;
    if (position === 'left') return playerRect.left - panelWidth - margin > 0;
    if (position === 'right') return playerRect.right + panelWidth + margin < windowWidth;
    return false;
}

export function updateInterfacePosition(
    windowWidth: number,
    windowHeight: number,
    playerRef: HTMLElement | null,
    panelRef: HTMLElement | null
): InterfacePos | null {
    if (!playerRef || !panelRef) return null;

    const rect = playerRef.getBoundingClientRect();
    const panelWidth = panelRef.offsetWidth;
    const panelHeight = panelRef.offsetHeight;
    const margin = 12;

    let x = windowWidth / 2 - panelWidth / 2;
    let y = windowHeight / 2 - panelHeight / 2;
    let position: Position = 'bottom';

    const preferred: Position =
        rect.top < windowHeight / 3
            ? 'bottom'
            : rect.bottom > (2 * windowHeight) / 3
                ? 'top'
                : rect.left < windowWidth / 2
                    ? 'right'
                    : 'left';

    if (canAttachToPlayer(rect, panelWidth, panelHeight, windowWidth, windowHeight, preferred)) {
        if (preferred === 'top') {
            x = rect.left + rect.width / 2 - panelWidth / 2;
            y = rect.top - panelHeight - margin;
        } else if (preferred === 'bottom') {
            x = rect.left + rect.width / 2 - panelWidth / 2;
            y = rect.bottom + margin;
        } else if (preferred === 'left') {
            x = rect.left - panelWidth - margin;
            y = rect.top + rect.height / 2 - panelHeight / 2;
        } else if (preferred === 'right') {
            x = rect.right + margin;
            y = rect.top + rect.height / 2 - panelHeight / 2;
        }
        position = preferred;
    }

    // Arrow coordinates relative to panel
    const arrowX = rect.left + rect.width / 2 - x;
    const arrowY = rect.top + rect.height / 2 - y;

    return { x, y, position, arrowX, arrowY };
}
