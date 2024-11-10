let currentFadeOutTimerFE = null; // store the timer reference
let currentFadeOutTimerBE = null;

export function fadeOutFE(notification, timeExpired) // 2 ham nay giong y chang nhau, chi la tach ra thoi
{
   // clear any existing fade-out timer
   if (currentFadeOutTimerFE) {
      clearInterval(currentFadeOutTimerFE);
      notification.style.opacity = 1; // reset opacity to full
   }

   let opacity = 1;
   const fadeDuration = 50;
   const totalSteps = timeExpired / fadeDuration;
   const opacityDecrement = opacity / totalSteps;
   
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
   }, fadeDuration); // fade out the notification within ... seconds
}

export function fadeOutBE(notification, timeExpired) // 2 ham nay giong y chang nhau, chi la tach ra thoi
{
   // clear any existing fade-out timer
   if (currentFadeOutTimerBE) {
      clearInterval(currentFadeOutTimerBE);
      notification.style.opacity = 1; // reset opacity to full
   }

   let opacity = 1;
   const fadeDuration = 50;
   const totalSteps = timeExpired / fadeDuration;
   const opacityDecrement = opacity / totalSteps;
   
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
}