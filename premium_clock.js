/**
 * MEP ENTERPRISE • HIGH-QUALITY PREMIUM GLASS UI DIGITAL CLOCK ENGINE
 * Self-initializing, drift-free precision chronometer with 12h/24h toggle.
 */

(function () {
  'use strict';

  const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

  let is24Hour = false;
  try {
    is24Hour = localStorage.getItem('mep_clock_format') === '24h';
  } catch (e) {}

  function getClockHTML(container) {
    if (container.classList.contains('mep-portal-clock')) {
      return `
        <span class="mep-clock-date-sec" aria-hidden="true">
          <span class="mep-clock-eyebrow">
            <span class="mep-clock-beacon">
              <span class="mep-clock-beacon-ping"></span>
              <span class="mep-clock-beacon-dot"></span>
            </span>
            LIVE CLOCK
          </span>
          <span class="mep-clock-day-date" id="mep-clock-day-date">---, -- ---</span>
        </span>
        <span class="mep-clock-divider" aria-hidden="true"></span>
        <span class="mep-clock-time-sec" aria-hidden="true">
          <span class="mep-clock-digits" id="mep-clock-digits">--<span class="mep-clock-colon">:</span>--</span>
          <span class="mep-clock-seconds-pod">
            <span class="mep-clock-micro-label">SEC</span>
            <span class="mep-clock-seconds" id="mep-clock-seconds">--</span>
          </span>
          <span class="mep-clock-format-pod">
            <span class="mep-clock-micro-label">MODE</span>
            <span class="mep-clock-ampm ${is24Hour ? 'mep-clock-24h' : ''}" id="mep-clock-ampm">${is24Hour ? '24H' : '--'}</span>
          </span>
        </span>
      `;
    }

    return `
      <div class="mep-clock-date-sec">
        <span class="mep-clock-beacon">
          <span class="mep-clock-beacon-ping"></span>
          <span class="mep-clock-beacon-dot"></span>
        </span>
        <span class="mep-clock-day-date" id="mep-clock-day-date">---, -- ---</span>
      </div>
      <div class="mep-clock-divider"></div>
      <div class="mep-clock-time-sec">
        <span class="mep-clock-digits" id="mep-clock-digits">--<span class="mep-clock-colon">:</span>--</span>
        <span class="mep-clock-seconds" id="mep-clock-seconds">:--</span>
        <span class="mep-clock-ampm ${is24Hour ? 'mep-clock-24h' : ''}" id="mep-clock-ampm">${is24Hour ? '24H' : '--'}</span>
      </div>
    `;
  }

  function updateClockElements() {
    if (document.hidden) return;
    const now = new Date();
    const dayName = DAYS[now.getDay()];
    const dateNum = String(now.getDate()).padStart(2, '0');
    const monthName = MONTHS[now.getMonth()];
    const dateStr = `${dayName}, ${dateNum} ${monthName}`;

    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    let ampm = '';
    if (is24Hour) {
      hours = String(hours).padStart(2, '0');
      ampm = '24H';
    } else {
      ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? String(hours).padStart(2, '0') : '12';
    }

    const clockContainers = document.querySelectorAll('.mep-glass-clock-capsule, #mep-premium-clock');
    clockContainers.forEach(container => {
      const isPortalClock = container.classList.contains('mep-portal-clock');
      const dayDateEl = container.querySelector('#mep-clock-day-date, .mep-clock-day-date');
      const digitsEl = container.querySelector('#mep-clock-digits, .mep-clock-digits');
      const secondsEl = container.querySelector('#mep-clock-seconds, .mep-clock-seconds');
      const ampmEl = container.querySelector('#mep-clock-ampm, .mep-clock-ampm');

      if (dayDateEl && dayDateEl.textContent !== dateStr) {
        dayDateEl.textContent = dateStr;
      }

      const hmStr = `${hours}:${minutes}`;
      if (digitsEl && digitsEl._lastHm !== hmStr) {
        digitsEl._lastHm = hmStr;
        digitsEl.innerHTML = `${hours}<span class="mep-clock-colon">:</span>${minutes}`;
      }

      const secondsStr = isPortalClock ? seconds : `:${seconds}`;
      if (secondsEl && secondsEl.textContent !== secondsStr) {
        secondsEl.textContent = secondsStr;
      }

      if (ampmEl && ampmEl.textContent !== ampm) {
        ampmEl.textContent = ampm;
        if (is24Hour) {
          ampmEl.classList.add('mep-clock-24h');
        } else {
          ampmEl.classList.remove('mep-clock-24h');
        }
      }

      if (isPortalClock) {
        container.setAttribute('aria-pressed', String(is24Hour));
        container.setAttribute('aria-label', `Live local time: ${dateStr} ${now.getFullYear()}, ${hours}:${minutes}:${seconds}${is24Hour ? '' : ' ' + ampm}. Toggle 24-hour format.`);
        container.setAttribute('title', `Live local time • Switch to ${is24Hour ? '12' : '24'}-hour format`);
      }
    });
  }

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) updateClockElements();
  });

  window.toggleClockHourFormat = function (event) {
    if (event) event.stopPropagation();
    is24Hour = !is24Hour;
    try {
      localStorage.setItem('mep_clock_format', is24Hour ? '24h' : '12h');
    } catch (e) {}
    updateClockElements();
  };

  function initMEPPremiumClock() {
    const containers = document.querySelectorAll('.mep-glass-clock-capsule, #mep-premium-clock');
    containers.forEach(container => {
      if (!container.querySelector('.mep-clock-time-sec')) {
        container.innerHTML = getClockHTML(container);
      }
      container.setAttribute('onclick', 'toggleClockHourFormat(event)');
      if (!container.classList.contains('mep-portal-clock')) {
        container.setAttribute('title', 'Click to toggle 12h / 24h format • Bangladesh Standard Time (BST)');
        container.setAttribute('role', 'timer');
      }
      container.setAttribute('aria-live', 'off');
    });

    updateClockElements();

    // Align with system seconds tick
    const now = new Date();
    const msToNextSecond = 1000 - now.getMilliseconds();
    setTimeout(() => {
      updateClockElements();
      setInterval(updateClockElements, 1000);
    }, msToNextSecond);
  }

  window.initMEPPremiumClock = initMEPPremiumClock;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMEPPremiumClock);
  } else {
    initMEPPremiumClock();
  }
})();
