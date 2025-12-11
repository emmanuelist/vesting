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