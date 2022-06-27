export var Gestures;
(function (Gestures) {
    Gestures.activeGestures = [];
    const eventListeners = {};
    function addGesture(event) {
        let gesture = new Gesture(event);
        Gestures.activeGestures.push(gesture);
        fireEvent('gestureBegin', gesture.pointerId);
        return gesture.pointerId;
    }
    Gestures.addGesture = addGesture;
    function updateGestures(event) {
        const gesture = getGesture(event.pointerId);
        if (gesture === undefined)
            return;
        gesture.lastEvent = event;
        fireEvent('gestureMove', gesture.pointerId);
    }
    Gestures.updateGestures = updateGestures;
    function removeGesture(event) {
        let i = _.findIndex(Gestures.activeGestures, {
            pointerId: event.pointerId,
        });
        if (i === -1)
            return;
        fireEvent('gestureEnd', event.pointerId);
        _.pullAt(Gestures.activeGestures, i);
        // console.log(activeGestures);
        if (Gestures.activeGestures.length === 0)
            return;
        for (const gesture of Gestures.activeGestures) {
            gesture.startEvent = gesture.lastEvent;
        }
        fireEvent('gestureBegin', null);
    }
    Gestures.removeGesture = removeGesture;
    function getGesture(pointerId) {
        return _.find(Gestures.activeGestures, { pointerId: pointerId });
    }
    Gestures.getGesture = getGesture;
    function addEventListener(type, listener) {
        if (!eventListeners[type]) {
            eventListeners[type] = [];
        }
        eventListeners[type].push(listener);
    }
    Gestures.addEventListener = addEventListener;
    function removeEventListener(type, listener) {
        if (!eventListeners[type])
            return false;
        let i = _.indexOf(eventListeners[type], listener);
        if (i === -1)
            return false;
        _.pullAt(eventListeners[type], i);
        return true;
    }
    Gestures.removeEventListener = removeEventListener;
    function fireEvent(type, pointerId) {
        for (const listener of eventListeners[type]) {
            listener(pointerId);
        }
    }
})(Gestures || (Gestures = {}));
export class Gesture {
    constructor(event) {
        this.pointerId = event.pointerId;
        this.startEvent = event;
        this.lastEvent = this.startEvent;
    }
}
//# sourceMappingURL=pointerGestures.js.map