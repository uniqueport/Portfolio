/* Accessible carousel with keyboard, buttons, dots, swipe and lazy loading.
   Update slides by editing the <ul id="carouselTrack"> in the HTML.
*/

(function(){
  const track = document.getElementById('carouselTrack');
  const slides = () => Array.from(track.querySelectorAll('.carousel-slide'));
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const dotsContainer = document.getElementById('carouselDots');
  const openAllBtn = document.getElementById('openAllBtn');

  // Lazy load images (data-src)
  function lazyLoad() {
    document.querySelectorAll('img.lazy').forEach(img => {
      if(img.dataset.src && img.getBoundingClientRect().top < window.innerHeight + 200) {
        img.src = img.dataset.src;
        img.classList.remove('lazy');
      }
    });
  }
  lazyLoad();
  window.addEventListener('scroll', lazyLoad, {passive:true});
  window.addEventListener('resize', lazyLoad);

  // Build dots
  function buildDots(){
    dotsContainer.innerHTML = '';
    slides().forEach((slide, i) => {
      const btn = document.createElement('button');
      btn.className = 'carousel-dot';
      btn.setAttribute('role','tab');
      btn.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      btn.setAttribute('aria-label', `Go to slide ${i+1}`);
      btn.addEventListener('click', ()=> goToSlide(i));
      dotsContainer.appendChild(btn);
    });
  }

  let currentIndex = 0;
  function updateTrack(){
    const width = slides()[0].getBoundingClientRect().width + parseFloat(getComputedStyle(track).gap || 0);
    const offset = (width) * currentIndex * -1;
    track.style.transform = `translateX(${offset}px)`;
    // update dots aria-selected
    const dots = Array.from(dotsContainer.children);
    dots.forEach((d,i)=>{
      d.setAttribute('aria-selected', i===currentIndex ? 'true' : 'false');
    });
    // lazy load near slides
    lazyLoad();
  }

  function goToSlide(index){
    const total = slides().length;
    if(index < 0) index = total - 1;
    if(index >= total) index = 0;
    currentIndex = index;
    updateTrack();
  }

  prevBtn.addEventListener('click', ()=> goToSlide(currentIndex - 1));
  nextBtn.addEventListener('click', ()=> goToSlide(currentIndex + 1));

  // Keyboard navigation
  const viewport = document.querySelector('.carousel-viewport');
  viewport.addEventListener('keydown', (e)=>{
    if(e.key === 'ArrowLeft'){ prevBtn.click(); e.preventDefault(); }
    if(e.key === 'ArrowRight'){ nextBtn.click(); e.preventDefault(); }
    if(e.key === 'Home'){ goToSlide(0); e.preventDefault(); }
    if(e.key === 'End'){ goToSlide(slides().length - 1); e.preventDefault(); }
  });

  // click slide to open the full image or file in new tab
  track.addEventListener('click', (e)=>{
    const slide = e.target.closest('.carousel-slide');
    if(!slide) return;
    const img = slide.querySelector('img');
    const src = img && (img.src || img.dataset.src);
    if(src){
      window.open(src, '_blank', 'noopener');
    }
  });

  // Swipe for touch
  let startX = 0, currentX = 0, isDown=false;
  track.addEventListener('pointerdown', (e)=>{
    isDown = true; startX = e.clientX; track.style.transition = 'none';
  });
  window.addEventListener('pointermove', (e)=>{
    if(!isDown) return;
    currentX = e.clientX;
    const delta = currentX - startX;
    track.style.transform = `translateX(${ -currentIndex * (slides()[0].getBoundingClientRect().width + parseFloat(getComputedStyle(track).gap || 0)) + delta }px)`;
  });
  window.addEventListener('pointerup', (e)=>{
    if(!isDown) return;
    isDown=false; track.style.transition = '';
    const delta = e.clientX - startX;
    if(Math.abs(delta) > 60){
      if(delta > 0) goToSlide(currentIndex - 1);
      else goToSlide(currentIndex + 1);
    } else {
      updateTrack();
    }
  });

  // open all — open images/PDFs in new tabs (useful for review)
  openAllBtn.addEventListener('click', (e)=>{
    e.preventDefault();
    slides().forEach(slide=>{
      const img = slide.querySelector('img');
      const src = img && (img.dataset.src || img.src);
      if(src) window.open(src, '_blank', 'noopener');
    });
  });

  // Initialize
  buildDots();
  updateTrack();
  // initial year in footer
  document.getElementById('year').textContent = new Date().getFullYear();

  // make carousel responsive: recalc transform on resize
  let resizeTimer;
  window.addEventListener('resize', ()=>{
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(updateTrack, 120);
  });

  // Expose function to dynamically add certificate slides (if needed)
  window.AddCertificateSlide = function({src, alt, caption}){
    const li = document.createElement('li');
    li.className = 'carousel-slide';
    li.setAttribute('role','group');
    li.innerHTML = `
      <img data-src="${src}" alt="${alt || 'Certificate image'}" class="carousel-img lazy" loading="lazy" />
      <figcaption>${caption || ''}</figcaption>
    `;
    track.appendChild(li);
    buildDots();
    lazyLoad();
  };

})();
