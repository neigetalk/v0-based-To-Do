/**
 * South Korean public holidays for 2024–2026, including substitute holidays (대체공휴일).
 * Format: 'yyyy-MM-dd'
 *
 * Sources: Korean Ministry of the Interior, KCTC official holiday notices.
 * Includes: 설날, 추석 (3-day windows), 석가탄신일, 어린이날, 삼일절,
 *           광복절, 개천절, 한글날, 현충일, 크리스마스, 신정, and any
 *           declared임시공휴일 (temporary holidays such as election days).
 */
export const KOREAN_HOLIDAYS = new Set<string>([
  // ── 2024 ──────────────────────────────────────────────────────────────
  '2024-01-01', // 신정 (New Year's Day)
  '2024-02-09', // 설날 연휴
  '2024-02-10', // 설날 — Saturday
  '2024-02-11', // 설날 연휴 — Sunday
  '2024-02-12', // 대체공휴일 (substitute for 2/10 Sat & 2/11 Sun)
  '2024-03-01', // 삼일절 (Independence Movement Day)
  '2024-04-10', // 국회의원 선거일 (National Assembly Election)
  '2024-05-05', // 어린이날 (Children's Day) — Sunday
  '2024-05-06', // 대체공휴일 (substitute for 5/5 Sunday)
  '2024-05-15', // 석가탄신일 (Buddha's Birthday)
  '2024-06-06', // 현충일 (Memorial Day)
  '2024-08-15', // 광복절 (Liberation Day)
  '2024-09-16', // 추석 연휴
  '2024-09-17', // 추석 (Chuseok)
  '2024-09-18', // 추석 연휴
  '2024-10-03', // 개천절 (National Foundation Day)
  '2024-10-09', // 한글날 (Hangeul Day)
  '2024-12-25', // 크리스마스 (Christmas)

  // ── 2025 ──────────────────────────────────────────────────────────────
  '2025-01-01', // 신정
  '2025-01-28', // 설날 연휴
  '2025-01-29', // 설날
  '2025-01-30', // 설날 연휴
  '2025-03-01', // 삼일절 — Saturday
  '2025-03-03', // 대체공휴일 (substitute for 3/1 Saturday)
  '2025-05-05', // 어린이날 + 석가탄신일 (both fall on same day)
  '2025-05-06', // 대체공휴일 (substitute: 석가탄신일 displaced by 어린이날)
  '2025-06-03', // 임시공휴일 (대통령선거일)
  '2025-06-06', // 현충일
  '2025-08-15', // 광복절
  '2025-10-03', // 개천절
  '2025-10-05', // 추석 연휴 — Sunday
  '2025-10-06', // 추석
  '2025-10-07', // 추석 연휴
  '2025-10-08', // 대체공휴일 (substitute for 10/5 Sunday)
  '2025-10-09', // 한글날
  '2025-12-25', // 크리스마스

  // ── 2026 ──────────────────────────────────────────────────────────────
  '2026-01-01', // 신정
  '2026-02-16', // 설날 연휴
  '2026-02-17', // 설날
  '2026-02-18', // 설날 연휴
  '2026-03-01', // 삼일절 — Sunday
  '2026-03-02', // 대체공휴일 (substitute for 3/1 Sunday)
  '2026-05-05', // 어린이날
  '2026-05-24', // 석가탄신일 — Sunday
  '2026-05-25', // 대체공휴일 (substitute for 석가탄신일)
  '2026-06-06', // 현충일 — Saturday (현충일 has no substitute, still marked red)
  '2026-08-15', // 광복절 — Saturday
  '2026-08-17', // 대체공휴일 (substitute for 8/15 Saturday)
  '2026-09-24', // 추석 연휴
  '2026-09-25', // 추석
  '2026-09-26', // 추석 연휴 — Saturday
  '2026-09-28', // 대체공휴일 (substitute for 9/26 Saturday)
  '2026-10-03', // 개천절 — Saturday
  '2026-10-05', // 대체공휴일 (substitute for 10/3 Saturday)
  '2026-10-09', // 한글날
  '2026-12-25', // 크리스마스
])
