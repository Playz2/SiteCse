

const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQNbB5nPbBjGHMg7nLGiW0JFnoQlbYuiMnVFZ90ATa3dFfI2qZaSTrNbnRjo6cqn-xmQ8JpODbcbn_g/pubhtml";

const $ = selector => document.querySelector(selector);


let eventData = [];
let currentIndex = 0;


async function fetchSheetData() {
    try {
        const response = await fetch(sheetURL);
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


async function fetchSheetDataAlternative() {
    
    const sheetId = sheetURL.match(/[-\w]{25,}/)?.[0] || '';
    if (!sheetId) {
        console.error('Could not extract sheet ID from URL');
        return [];
    }
    
    try {
     
        const jsonUrl = `https://spreadsheets.google.com/feeds/list/${sheetId}/1/public/values?alt=json`;
        const response = await fetch(jsonUrl);
        const data = await response.json();
        
        // Process the JSON response
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
    
    currentIndex = (currentIndex + 1) % eventData.length;
    
    if ($(".hide")) $(".hide").remove();
    
    if ($(".prev")) {
        $(".prev").classList.add("hide");
        $(".prev").classList.remove("prev");
    }
    
    $(".act").classList.add("prev");
    $(".act").classList.remove("act");
    
    $(".next").classList.add("act");
    $(".next").classList.remove("next");
    
    $(".new-next").classList.add("next");
    $(".new-next").classList.remove("new-next");
    
    // Add new "next" card
    const newNextIndex = (currentIndex + 2) % eventData.length;
    const newNextEvent = eventData[newNextIndex];
    const newNextCard = buildEventCard(newNextEvent, 'new-next');
    $(".list").appendChild(newNextCard);
}

function prev() {
    if (eventData.length <= 1) return;
    
    currentIndex = (currentIndex - 1 + eventData.length) % eventData.length;
    
    if ($(".new-next")) $(".new-next").remove();
    
    if ($(".next")) {
        $(".next").classList.add("new-next");
        $(".next").classList.remove("next");
    }
    
    $(".act").classList.add("next");
    $(".act").classList.remove("act");
    
    $(".prev").classList.add("act");
    $(".prev").classList.remove("prev");
    
    if ($(".hide")) {
        $(".hide").classList.add("prev");
        $(".hide").classList.remove("hide");
    }
    
   
    const newPrevIndex = (currentIndex - 1 + eventData.length) % eventData.length;
    const newPrevEvent = eventData[newPrevIndex];
    const newPrevCard = buildEventCard(newPrevEvent, 'hide');
    $(".list").insertBefore(newPrevCard, $(".list").firstChild);
}

function slide(el) {
    if (el.classList.contains("next")) next();
    else if (el.classList.contains("prev")) prev();
}


function setupEventListeners() {
    const swipeArea = $(".swipe");
    
   
    let startX, endX;
    swipeArea.addEventListener('touchstart', e => {
        startX = e.touches[0].clientX;
    });
    
    swipeArea.addEventListener('touchend', e => {
        endX = e.changedTouches[0].clientX;
        handleSwipe();
    });
    
    
    document.addEventListener('click', e => {
        if (e.target.closest('.prev')) prev();
        if (e.target.closest('.next')) next();
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
      
        eventData = await fetchSheetData();
        
        
        if (eventData.length === 0) {
            eventData = await fetchSheetDataAlternative();
        }
        
       
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
        
        initializeCarousel();
        setupEventListeners();
        
    } catch (error) {
        console.error('Error initializing carousel:', error);
        $('.list').innerHTML = '<li class="act"><p>A apărut o eroare la încărcarea evenimentelor.</p></li>';
    }
}


document.addEventListener('DOMContentLoaded', init);