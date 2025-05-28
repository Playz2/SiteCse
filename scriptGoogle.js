const sheetURL = "https://docs.google.com/spreadsheets/d/1r83mpJYqoVUZihEidyeq_HfNaQyLH9Nf90yM2dAuEqI/edit?usp=sharing";

const $ = selector => document.querySelector(selector);

let eventData = [];
let currentIndex = 0;

async function fetchSheetData() {
    try {
        // Add cache busting parameter
        const cacheBuster = new Date().getTime();
        const response = await fetch(`${sheetURL}&cachebust=${cacheBuster}`, {
            cache: 'no-cache'
        });
        const html = await response.text();
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        const table = doc.querySelector('table');
        if (!table) {
            console.error('No table found in Google Sheet HTML');
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
        console.error('Error fetching Google Sheet data:', error);
        return [];
    }
}
async function fetchSheetDataAlternative() {  // Add this function declaration
    const sheetId = "1r83mpJYqoVUZihEidyeq_HfNaQyLH9Nf90yM2dAuEqI";
    if (!sheetId) {
        console.error('Could not extract sheet ID from URL');
        return [];
    }
    
    try {
        // Add cache busting parameter
        const cacheBuster = new Date().getTime();
        const jsonUrl = `https://spreadsheets.google.com/feeds/list/${sheetId}/1/public/values?alt=json&cachebust=${cacheBuster}`;
        const response = await fetch(jsonUrl, {
            cache: 'no-cache'
        });
        const data = await response.json();
        
        return data.feed.entry.map(entry => ({
            Nume: entry.gsx$nume?.$t || 'Titlu lipsă',
            Data: entry.gsx$data?.$t || 'Dată necunoscută',
            Locatie: entry.gsx$locatie?.$t || 'Locație necunoscută',
            Descriere: entry.gsx$descriere?.$t || 'Fără descriere'
        }));
    } catch (error) {
        console.error('Error fetching Google Sheet data (alternative method):', error);
        return [];
    }
}
async function fetchSheetDataCSV() {
    const sheetId = "1r83mpJYqoVUZihEidyeq_HfNaQyLH9Nf90yM2dAuEqI";
    if (!sheetId) {
        console.error('Could not extract sheet ID from URL');
        return [];
    }
    
    try {
        const cacheBuster = new Date().getTime();
        const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=0&cachebust=${cacheBuster}`;
        const response = await fetch(csvUrl, {
            cache: 'no-cache'
        });
        const csvText = await response.text();
        
        // Split into lines while preserving newlines within quoted fields
        const lines = csvText.split(/\r?\n(?=(?:[^"]*"[^"]*")*[^"]*$)/).filter(line => line.trim());
        const headers = parseCSVLine(lines[0]);
        
        console.log('CSV Headers:', headers);
        console.log('Raw CSV text:', csvText); // Debug line
        
        const events = [];
        for (let i = 1; i < lines.length; i++) {
            const values = parseCSVLine(lines[i]);
            console.log('Parsed line:', values); // Debug line
            if (values.length >= 4 && values[0]) {
                events.push({
                    Nume: values[0] || 'Titlu lipsă',
                    Data: values[1] || 'Dată necunoscută',
                    Locatie: values[2] || 'Locație necunoscută',
                    Descriere: values[3] || 'Fără descriere'
                });
            }
        }
        
        console.log('Parsed events:', events);
        return events;
    } catch (error) {
        console.error('Error fetching CSV data:', error);
        return [];
    }
}

// Add this helper function to properly parse CSV lines with quotes
function parseCSVLine(line) {
    const results = [];
    let field = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            if (i + 1 < line.length && line[i + 1] === '"') {
                // Handle escaped quotes
                field += '"';
                i++; // Skip next quote
            } else {
                // Toggle quote mode
                inQuotes = !inQuotes;
                continue; // Skip the quote character
            }
        } else if (char === ',' && !inQuotes) {
            // End of field
            results.push(field.trim());
            field = '';
        } else if (char === '\n' && !inQuotes) {
            // Handle newlines outside quotes
            results.push(field.trim());
            field = '';
        } else {
            // Add character to current field
            field += char;
        }
    }
    
    // Add the last field
    if (field) {
        results.push(field.trim());
    }
    
    // Clean up any remaining quotes at the start/end of fields
    return results.map(field => {
        if (field.startsWith('"') && field.endsWith('"')) {
            return field.slice(1, -1).trim();
        }
        return field.trim();
    });
}


function buildEventCard(event, position) {
    const li = document.createElement('li');
    li.classList.add(position);

    li.innerHTML = `
        <h3>${event.Nume}</h3>
        <p><strong>Data:</strong> ${event.Data}</p>
        <p><strong>Locație:</strong> ${event.Locatie}</p>
        <p>${event.Descriere}</p>
    `;

    return li;
}

function initializeCarousel() {
    const list = $('.list');
    list.innerHTML = ''; 
    
    if (eventData.length === 0) {
        list.innerHTML = '<li class="act"><p>Nu există evenimente disponibile.</p></li>';
        return;
    }
    
    const positions = ['prev', 'act', 'next'];
    
    for (let i = 0; i < Math.min(3, eventData.length); i++) {
        const position = positions[i];
        const event = eventData[(currentIndex + i) % eventData.length];
        const card = buildEventCard(event, position);
        list.appendChild(card);
    }
    
    if (eventData.length > 3) {
        const hiddenEvent = eventData[(currentIndex + 3) % eventData.length];
        const hiddenCard = buildEventCard(hiddenEvent, 'new-next');
        list.appendChild(hiddenCard);
    }
}

function next() {
    if (eventData.length <= 1) return;
    
    const listElement = $(".list");
    if (!listElement) {
        console.error("List element not found");
        return;
    }
    
    currentIndex = (currentIndex + 1) % eventData.length;
    
    const hideElement = $(".hide");
    if (hideElement) hideElement.remove();
    
    const prevElement = $(".prev");
    if (prevElement) {
        prevElement.classList.add("hide");
        prevElement.classList.remove("prev");
    }
    
    const actElement = $(".act");
    if (actElement) {
        actElement.classList.add("prev");
        actElement.classList.remove("act");
    }
    
    const nextElement = $(".next");
    if (nextElement) {
        nextElement.classList.add("act");
        nextElement.classList.remove("next");
    }
    
    const newNextElement = $(".new-next");
    if (newNextElement) {
        newNextElement.classList.add("next");
        newNextElement.classList.remove("new-next");
    }
    
    const newNextIndex = (currentIndex + 2) % eventData.length;
    const newNextEvent = eventData[newNextIndex];
    const newNextCard = buildEventCard(newNextEvent, 'new-next');
    listElement.appendChild(newNextCard);
}

function prev() {
    if (eventData.length <= 1) return;
    
    const listElement = $(".list");
    if (!listElement) {
        console.error("List element not found");
        return;
    }
    
    currentIndex = (currentIndex - 1 + eventData.length) % eventData.length;
    
    const newNextElement = $(".new-next");
    if (newNextElement) newNextElement.remove();
    
    const nextElement = $(".next");
    if (nextElement) {
        nextElement.classList.add("new-next");
        nextElement.classList.remove("next");
    }
    
    const actElement = $(".act");
    if (actElement) {
        actElement.classList.add("next");
        actElement.classList.remove("act");
    }
    
    const prevElement = $(".prev");
    if (prevElement) {
        prevElement.classList.add("act");
        prevElement.classList.remove("prev");
    }
    
    const hideElement = $(".hide");
    if (hideElement) {
        hideElement.classList.add("prev");
        hideElement.classList.remove("hide");
    }
    
    const newPrevIndex = (currentIndex - 1 + eventData.length) % eventData.length;
    const newPrevEvent = eventData[newPrevIndex];
    const newPrevCard = buildEventCard(newPrevEvent, 'hide');
    listElement.insertBefore(newPrevCard, listElement.firstChild);
}

function slide(el) {
    if (el.classList.contains("next")) next();
    else if (el.classList.contains("prev")) prev();
}

function setupEventListeners() {
    const swipeArea = $(".swipe");
    
    if (swipeArea) {
        let startX, endX;
        swipeArea.addEventListener('touchstart', e => {
            startX = e.touches[0].clientX;
        });
        
        swipeArea.addEventListener('touchend', e => {
            endX = e.changedTouches[0].clientX;
            handleSwipe();
        });
    }
    
    document.addEventListener('click', e => {
        const prevElement = e.target.closest('.prev');
        const nextElement = e.target.closest('.next');
        
        if (prevElement) {
            e.preventDefault();
            prev();
        } else if (nextElement) {
            e.preventDefault();
            next();
        }
    });
    
    function handleSwipe() {
        const threshold = 50;
        if (startX - endX > threshold) {
            next(); 
        } else if (endX - startX > threshold) {
            prev(); 
        }
    }
}

async function init() {
    try {
        // Clear any existing data
        eventData = [];
        
        console.log('Starting initialization...');
        
        // Check if required DOM elements exist
        const listElement = $('.list');
        if (!listElement) {
            console.error('Required .list element not found in DOM');
            return;
        }
        
        // Try to fetch fresh data using different methods
        console.log('Trying CSV method first...');
        eventData = await fetchSheetDataCSV();
        
        if (eventData.length === 0) {
            console.log('CSV method failed, trying HTML method...');
            eventData = await fetchSheetData();
        }
        
        if (eventData.length === 0) {
            console.log('HTML method failed, trying JSON feed method...');
            eventData = await fetchSheetDataAlternative();
        }
        
        // Log the fetched data for debugging
        console.log('Fetched event data:', eventData);
        
        if (eventData.length === 0) {
            console.warn('Could not fetch data from Google Sheet. Using placeholder data instead.');
            eventData = [
                {
                    Nume: 'Eveniment 1',
                    Data: '01.05.2025',
                    Locatie: 'București',
                    Descriere: 'Aceasta este o descriere pentru primul eveniment.'
                },
                {
                    Nume: 'Eveniment 2',
                    Data: '15.05.2025',
                    Locatie: 'Cluj',
                    Descriere: 'Aceasta este o descriere pentru al doilea eveniment.'
                },
                {
                    Nume: 'Eveniment 3',
                    Data: '30.05.2025',
                    Locatie: 'Timișoara',
                    Descriere: 'Aceasta este o descriere pentru al treilea eveniment.'
                }
            ];
        }
        
        console.log('Initializing carousel with', eventData.length, 'events');
        initializeCarousel();
        setupEventListeners();
        console.log('Initialization complete');
        
    } catch (error) {
        console.error('Error initializing carousel:', error);
        const listElement = $('.list');
        if (listElement) {
            listElement.innerHTML = '<li class="act"><p>A apărut o eroare la încărcarea evenimentelor.</p></li>';
        }
    }
}

document.addEventListener('DOMContentLoaded', init);