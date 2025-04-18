const calendarSheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQNbB5nPbBjGHMg7nLGiW0JFnoQlbYuiMnVFZ90ATa3dFfI2qZaSTrNbnRjo6cqn-xmQ8JpODbcbn_g/pubhtml";
const qs = selector => document.querySelector(selector);

// **Remove the old sample eventData declaration here**

async function fetchCalendarSheetData() {
    try {
        const response = await fetch(calendarSheetURL);
        const html = await response.text();

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const table = doc.querySelector('table');
        if (!table) {
            console.error('No table found in calendar sheet HTML');
            return [];
        }

        const rows = Array.from(table.querySelectorAll('tr')).slice(1);
        return rows.map(row => {
            const cells = row.querySelectorAll('td');
            return {
                Nume: cells[0]?.textContent.trim() || 'Titlu lipsă',
                Data: cells[1]?.textContent.trim() || 'Dată necunoscută',
                Locatie: cells[2]?.textContent.trim() || 'Locație necunoscută',
                Descriere: cells[3]?.textContent.trim() || 'Fără descriere'
            };
        }).filter(event => event.Nume !== 'Titlu lipsă');
    } catch (error) {
        console.error('Error fetching calendar sheet data:', error);
        return [];
    }
}

// Global variables for calendar
let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();

// Helper function to convert month names to numbers
function getRomanianMonthNumber(monthName) {
    const months = {
        'ianuarie': '01',
        'februarie': '02',
        'martie': '03',
        'aprilie': '04',
        'mai': '05',
        'iunie': '06',
        'iulie': '07',
        'august': '08',
        'septembrie': '09',
        'octombrie': '10',
        'noiembrie': '11',
        'decembrie': '12'
    };

    return months[monthName.toLowerCase()] || '01'; // Default to January if not found
}

// Calendar initialization function
function initCalendar() {
    renderCalendar();
    setupCalendarEventListeners();

    // Once we have event data, highlight the dates
    if (eventData && eventData.length > 0) {
        highlightEventDates();
    }
}

// Render the calendar structure
function renderCalendar() {
    const monthNames = ['Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie', 
                       'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'];

    // Update header
    document.getElementById('calendar-month-year').textContent = `${monthNames[currentMonth]} ${currentYear}`;

    // Get days container
    const daysContainer = document.getElementById('calendar-days');
    daysContainer.innerHTML = '';

    // Get first day of month (0 = Sunday, 1 = Monday, etc.)
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();

    // Get number of days in month
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Add empty cells for days before the first day of month
    for (let i = 0; i < firstDay; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'day empty';
        daysContainer.appendChild(emptyCell);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = document.createElement('div');
        dayCell.className = 'day';
        dayCell.textContent = day;
        dayCell.dataset.date = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        daysContainer.appendChild(dayCell);
    }
}

// Setup event listeners for calendar navigation and day selection
function setupCalendarEventListeners() {
    document.getElementById('prev-month').addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar();
        highlightEventDates();
    });

    document.getElementById('next-month').addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar();
        highlightEventDates();
    });

    document.getElementById('calendar-days').addEventListener('click', (e) => {
        if (e.target.classList.contains('day') && !e.target.classList.contains('empty')) {
            showEventsForDate(e.target.dataset.date);
        }
    });
}

// Highlight dates that have events
function highlightEventDates() {
    document.querySelectorAll('.day.has-event').forEach(day => {
        day.classList.remove('has-event');
    });

    const defaultYear = currentYear;

    eventData.forEach(event => {
        if (!event.Data || event.Data === 'Dată necunoscută') return;

        let day, month, year;

        if (event.Data.includes('.')) {
            [day, month, year] = event.Data.split('.');
        } else {
            const parts = event.Data.trim().split(' ');
            if (parts.length >= 2) {
                day = parts[0];
                const monthName = parts[1];
                month = getRomanianMonthNumber(monthName);
                year = defaultYear.toString();
            } else return;
        }

        if (!day || !month || !year) return;

        const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        const dayElement = document.querySelector(`.day[data-date="${formattedDate}"]`);
        if (dayElement) {
            dayElement.classList.add('has-event');
        }
    });
}

// Show events for a selected date
function showEventsForDate(dateString) {
    const [year, month, day] = dateString.split('-');

    const monthNames = ['ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie', 
                        'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie'];
    const monthName = monthNames[parseInt(month) - 1];

    const eventsForDate = eventData.filter(event => {
        if (event.Data.includes(' ')) {
            const parts = event.Data.trim().split(' ');
            return parts[0] === day && parts[1].toLowerCase() === monthName;
        } else if (event.Data.includes('.')) {
            const [eventDay, eventMonth] = event.Data.split('.');
            return eventDay === day && eventMonth === month;
        }
        return false;
    });

    const eventDetailsContainer = document.getElementById('calendar-event-details');

    if (eventsForDate.length === 0) {
        const monthNameCapitalized = monthName.charAt(0).toUpperCase() + monthName.slice(1);
        eventDetailsContainer.innerHTML = `<p>Nu există evenimente programate pentru ${day} ${monthNameCapitalized}</p>`;
        return;
    }

    const monthNameCapitalized = monthName.charAt(0).toUpperCase() + monthName.slice(1);
    let eventsHTML = `<h3>Evenimente pentru ${day} ${monthNameCapitalized}</h3>`;

    eventsForDate.forEach(event => {
        eventsHTML += `
        <div class="calendar-event">
            <h4>${event.Nume}</h4>
            <p><strong>Locație:</strong> ${event.Locatie}</p>
            <p>${event.Descriere}</p>
        </div>
        `;
    });

    eventDetailsContainer.innerHTML = eventsHTML;
}

// Initialize the calendar when the page loads
document.addEventListener('DOMContentLoaded', async function () {
    try {
        eventData = await fetchCalendarSheetData();

        if (eventData.length > 0) {
            initCalendar();
        } else {
            console.warn("No calendar events found.");
        }
    } catch (error) {
        console.error("Failed to load calendar data:", error);
    }
});
