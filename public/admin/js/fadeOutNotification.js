let currentFadeOutTimerFE = null; // store the timer reference
let currentFadeOutTimerBE = null;

// notification FE tuc la trang web khong bi load lai
// notification BE tuc la trang web bi load lai roi moi hien notification len

export function fadeOutFE(notification, timeExpired) // 2 ham fadeout na na nhau, chi la tach ra thoi
{
   // clear any existing fade-out timer
   if (currentFadeOutTimerFE) {
      clearInterval(currentFadeOutTimerFE);
      notification.style.opacity = 1; // reset opacity to full
   }

   const timeExistClear = timeExpired;

   let opacity = 1;
   const fadeDuration = 35; // toc do lam mo, so cang nho thi mo cang nhanh
   const totalSteps = 20;
   const opacityDecrement = opacity / totalSteps;
   
   currentFadeOutTimerFE = setTimeout(() => {

      currentFadeOutTimerFE = setInterval(() => {
         if(opacity <= 0) {
            clearInterval(currentFadeOutTimerFE);
            // notification.style.display = "none"; // su dung cai nay se ko mo rong duoc
            notification.classList.add("element-hidden");
         }
   
         notification.style.opacity = opacity;
         opacity = opacity - opacityDecrement;
   
         // ensure opacity does not go below 0
         if (opacity < 0) {
            opacity = 0;
         }
      }, fadeDuration); // fade out the notification within ... miliseconds

   }, timeExistClear);
}

export function fadeInFE(notification, fadeDuration = 1) 
{
   notification.style.opacity = 0;
   notification.classList.remove("element-hidden");

   let opacity = 0;
   const totalSteps = 20;
   const opacityIncrement = 1 / totalSteps;

   const fadeInInterval = setInterval(() => {
      if (opacity >= 1) {
         clearInterval(fadeInInterval); // stop when fully visible
      }

      notification.style.opacity = opacity;
      opacity = opacity + opacityIncrement;

      // ensure opacity does not exceed 1
      if (opacity > 1) {
         opacity = 1;
      }
   }, fadeDuration); // fade-in interval
}

export function fadeOutBE(notification, timeExpired) // 2 ham fadeout na na nhau, co them remove("fade-in-be")
{
   // clear any existing fade-out timer
   if (currentFadeOutTimerBE) {
      clearInterval(currentFadeOutTimerBE);
      notification.style.opacity = 1; // reset opacity to full
   }

   const timeExistClear = timeExpired;

   let opacity = 1;
   const fadeDuration = 35; // toc do lam mo, so cang nho thi mo cang nhanh
   const totalSteps = 20;
   const opacityDecrement = opacity / totalSteps;

   currentFadeOutTimerBE = setTimeout(() => {
      notification.classList.remove("fade-in-be");

      currentFadeOutTimerBE = setInterval(() => {
         if(opacity <= 0) {
            clearInterval(currentFadeOutTimerBE);
            // notification.style.display = "none"; // su dung cai nay se ko mo rong duoc
            
            notification.classList.add("element-hidden");
         }
   
         notification.style.opacity = opacity;
         opacity = opacity - opacityDecrement;
   
         // ensure opacity does not go below 0
         if (opacity < 0) {
            opacity = 0;
         }
      }, fadeDuration); // fade out the notification within ... seconds

   }, timeExistClear);
}