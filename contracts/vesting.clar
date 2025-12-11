;; Token Vesting Contract with Clarity 4 Features
;; Demonstrates: block-time, restrict-assets?, and to-consensus-buff?

;; ============================================
;; Constants and Error Codes
;; ============================================

(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-already-exists (err u102))
(define-constant err-vesting-not-started (err u103))
(define-constant err-no-tokens-available (err u104))
(define-constant err-unauthorized (err u105))
(define-constant err-invalid-schedule (err u106))

;; ============================================
;; Data Variables and Maps
;; ============================================

(define-data-var total-vesting-schedules uint u0)

;; Vesting schedule structure
(define-map vesting-schedules
  { beneficiary: principal }
  {
    total-amount: uint,
    claimed-amount: uint,
    start-time: uint,
    cliff-duration: uint,
    vesting-duration: uint,
    is-active: bool
  }
)

;; Track vesting events for transparency
(define-map vesting-events
  { event-id: uint }
  {
    beneficiary: principal,
    amount: uint,
    timestamp: uint,
    event-type: (string-ascii 20)
  }
)

(define-data-var event-counter uint u0)

;; ============================================
;; Clarity 4 Feature: block-time Usage
;; ============================================

;; Get the current block timestamp
(define-read-only (get-current-time)
  block-time
)

;; Calculate vested amount based on current time
(define-read-only (calculate-vested-amount (beneficiary principal))
  (match (map-get? vesting-schedules { beneficiary: beneficiary })
    schedule
    (let
      (
        (current-time block-time)
        (start-time (get start-time schedule))
        (cliff-end (+ start-time (get cliff-duration schedule)))
        (vesting-end (+ start-time (get vesting-duration schedule)))
        (total-amount (get total-amount schedule))
        (claimed-amount (get claimed-amount schedule))
      )
      (if (< current-time cliff-end)
        ;; Before cliff: no tokens vested
        (ok u0)
        (if (>= current-time vesting-end)
          ;; After vesting period: all tokens vested
          (ok (- total-amount claimed-amount))
          ;; During vesting: linear vesting calculation
          (let
            (
              (time-elapsed (- current-time start-time))
              (vesting-duration (get vesting-duration schedule))
              (vested-total (/ (* total-amount time-elapsed) vesting-duration))
              (available (- vested-total claimed-amount))
            )
            (ok available)
          )
        )
      )
    )
    err-not-found
  )
)

;; ============================================
;; Core Vesting Functions
;; ============================================

;; Create a new vesting schedule
(define-public (create-vesting-schedule
  (beneficiary principal)
  (total-amount uint)
  (cliff-duration uint)
  (vesting-duration uint)
)
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (asserts! (is-none (map-get? vesting-schedules { beneficiary: beneficiary })) err-already-exists)
    (asserts! (> total-amount u0) err-invalid-schedule)
    (asserts! (<= cliff-duration vesting-duration) err-invalid-schedule)
    
    (map-set vesting-schedules
      { beneficiary: beneficiary }
      {
        total-amount: total-amount,
        claimed-amount: u0,
        start-time: block-time,
        cliff-duration: cliff-duration,
        vesting-duration: vesting-duration,
        is-active: true
      }
    )