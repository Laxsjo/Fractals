export namespace Gestures {
	export type EventType = 'gestureMove' | 'gestureBegin' | 'gestureEnd';
	export type Listener = (pointerId: number | null) => any;

	export const activeGestures: Gesture[] = [];
	const eventListeners: {
		[type in Gestures.EventType]?: Gestures.Listener[];
	} = {};

	export function addGesture(event: PointerEvent): number {
		let gesture = new Gesture(event);
		activeGestures.push(gesture);

		fireEvent('gestureBegin', gesture.pointerId);

		return gesture.pointerId;
	}

	export function updateGestures(event: PointerEvent): number {
		const gesture = getGesture(event.pointerId);

		if (gesture === undefined) return;

		gesture.lastEvent = event;

		fireEvent('gestureMove', gesture.pointerId);
	}

	export function removeGesture(event: PointerEvent) {
		let i = _.findIndex(activeGestures, {
			pointerId: event.pointerId,
		});
		if (i === -1) return;

		fireEvent('gestureEnd', event.pointerId);

		_.pullAt(activeGestures, i);

		// console.log(activeGestures);

		if (activeGestures.length === 0) return;

		for (const gesture of activeGestures) {
			gesture.startEvent = gesture.lastEvent;
		}

		fireEvent('gestureBegin', null);
	}

	export function getGesture(pointerId: number): Gesture | undefined {
		return _.find(activeGestures, { pointerId: pointerId });
	}

	export function addEventListener(type: EventType, listener: Listener) {
		if (!eventListeners[type]) {
			eventListeners[type] = [];
		}

		eventListeners[type].push(listener);
	}

	export function removeEventListener(
		type: EventType,
		listener: Listener
	): boolean {
		if (!eventListeners[type]) return false;

		let i = _.indexOf(eventListeners[type], listener);

		if (i === -1) return false;

		_.pullAt(eventListeners[type], i);

		return true;
	}

	function fireEvent(type: EventType, pointerId: number | null) {
		for (const listener of eventListeners[type]) {
			listener(pointerId);
		}
	}
}

export class Gesture {
	public readonly pointerId: number;

	public startEvent: PointerEvent;
	public lastEvent: PointerEvent;

	constructor(event: PointerEvent) {
		this.pointerId = event.pointerId;

		this.startEvent = event;
		this.lastEvent = this.startEvent;
	}
}
