import { EMPTY, combineLatest, debounceTime, fromEvent, interval, map, merge, scan, shareReplay, startWith, switchMap } from 'rxjs'

document.addEventListener('DOMContentLoaded', () => {
    const counterText = document.querySelector<HTMLParagraphElement>('.counter')!
    const startButton = document.querySelector<HTMLButtonElement>('.start')!
    const pauseButton = document.querySelector<HTMLButtonElement>('.pause')!
    const resetButton = document.querySelector<HTMLButtonElement>('.reset')!
    const setButton = document.querySelector<HTMLButtonElement>('.set')!
    const setInput = document.querySelector<HTMLInputElement>('.setInput')!
    const delayInput = document.querySelector<HTMLInputElement>('.delay')!
    const stepInput = document.querySelector<HTMLInputElement>('.step')!

    const isCounting$ = merge(
        fromEvent(startButton, 'click').pipe(map(() => true)),
        fromEvent(pauseButton, 'click').pipe(map(() => false)),
    )
    const delay$ = fromEvent(delayInput, 'change').pipe(
        map(() => delayInput.valueAsNumber),
        startWith(delayInput.valueAsNumber),
    )
    const tick$ = combineLatest([isCounting$, delay$]).pipe(
        switchMap(([isCounting, delay]) => isCounting ? interval(delay) : EMPTY),
        map(() => undefined)
    )
    const step$ = fromEvent(stepInput, 'input').pipe(
        debounceTime(500),
        map(() => stepInput.valueAsNumber),
        startWith(stepInput.valueAsNumber),
    )
    const setTo$ = fromEvent(setButton, 'click').pipe(map(() => setInput.valueAsNumber))
    const reset$ = fromEvent(resetButton, 'click').pipe(map(() => 0))

    const counter$ = combineLatest([
        merge(
            tick$,
            reset$,
            setTo$
        ),
        step$
    ]).pipe(
        scan((count, [resetValue, step]) => resetValue ?? count + step, 0),
        shareReplay(1),
        startWith(0)
    )

    counter$.subscribe(val => counterText.innerText = val.toString())
})