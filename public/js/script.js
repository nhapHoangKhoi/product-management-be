import { fadeOutFE, fadeInFE, fadeOutBE } from "./fadeOutNotification.js";
import debounce from "./debounce.js";


// ----- Form search
const formSearch = document.querySelector("[form-search]"); // neu ko co thi formSearch tra ve null

if(formSearch)
{
   // http://localhost:3000/          <==  /    <==  localhost:3000//search
   // http://localhost:3000/products  <==  no /  <== localhost:3000/search
   const currentURL = new URL(window.location.href);
   let newURL = new URL(`${currentURL.origin}/search`);

   formSearch.addEventListener("submit", (event) => 
      {
         event.preventDefault();

         const searchedKeyword = event.target.elements.inputKeyword.value;

         if(!searchedKeyword) {
            return;
         }

         if(searchedKeyword) {
            newURL.searchParams.delete("page");
         }


         if(searchedKeyword) {
            newURL.searchParams.set("inputKeyword", searchedKeyword);
         }
         else {
            newURL.searchParams.delete("inputKeyword");
         }

         // http://localhost:3000/admin333/products?keyword=iPhone
         window.location.href = newURL.href; // this line is to "reload" (update link) the page
      }
   );
}
// ----- End form search


// ----- Password icon toggled
const passwordForm = document.querySelector(".password-form");

if(passwordForm)
{
   const passwordIcon = passwordForm.querySelector(".password-icon");
   
   passwordIcon.addEventListener("click", () => 
      {
         const passwordInput = passwordForm.querySelector("input[name='password']");
   
         if(passwordIcon.classList.contains("open") == true) {
            passwordIcon.classList.remove("open");
            passwordIcon.innerHTML = `<i class="fa-regular fa-eye-slash"></i>`;
            passwordInput.setAttribute("type", "password");
         }
         else {
            passwordIcon.classList.add("open");
            passwordIcon.innerHTML = `<i class="fa-regular fa-eye"></i>`;
            passwordInput.setAttribute("type", "text");
         }
      }
   );
}
// ----- End password icon toggled


// ----- Pagination
const listButtonPagination = document.querySelectorAll("[button-pagination]");

if(listButtonPagination.length > 0)
{
   let newURL = new URL(window.location.href);

   listButtonPagination.forEach((eachButton) => {
      eachButton.addEventListener("click", () => 
         {
            const page = eachButton.getAttribute("button-pagination");
            
            if(page) {
               newURL.searchParams.set("page", page);
            }
            else {
               newURL.searchParams.delete("page");
            }

            window.location.href = newURL.href;
         }
      );
   });
}
// ----- End pagination


// ----- Product images swiper
const productImages = document.querySelector(".product-images");
const productImagesSmallSlide = document.querySelector(".product-images-small-slide");

if(productImages && productImagesSmallSlide)
{
   const swiperSmall = new Swiper(".product-images-small-slide", {
      spaceBetween: 20,
      slidesPerView: 4,
      freeMode: true,
      watchSlidesProgress: true,
   });

   const swiperLarge = new Swiper(".product-images", {
      slidesPerView: 1,
      spaceBetween: 30,
      pagination: {
         el: ".swiper-pagination",
         clickable: true,
      },
      navigation: {
         nextEl: ".swiper-button-next",
         prevEl: ".swiper-button-prev",
      },
      thumbs: {
         swiper: swiperSmall,
      },
   });
}
// ----- End product images swiper


// ----- Update quantities in the cart
const listInputQuantity = document.querySelectorAll("[table-cart] input[name='quantity']");

if(listInputQuantity.length > 0)
{
   listInputQuantity.forEach(eachInput => {
      eachInput.addEventListener("change", () => 
         {
            const productId = eachInput.getAttribute("product-id");
            const quantity = parseInt(eachInput.value);

            // --- Use method GET --- //
            // if(productId && quantity > 0)
            // {
            //    window.location.href = `/cart/update/${productId}/${quantity}`;
            // }
            // --- End use method GET --- //


            // --- Use method PATCH --- //
            const link = `/cart/update/${productId}/${quantity}`;
            
            fetch(link, {
               method: "PATCH"
            })
               .then(responseFromController => responseFromController.json())
               .then(dataFromController => {
                  if(dataFromController.code == 200) {
                     window.location.reload();
                  }
               })
            // --- End use method PATCH --- //
         }
      );
   })
}
// End update quantities in the cart


// ----- Suggestion box
const boxSearch = document.querySelector(".box-search");

if(boxSearch)
{
   // const currentURL = new URL(window.location.href);
   // const pathName = currentURL.pathname;

   const inputSearch = boxSearch.querySelector("input[name='inputKeyword']");

   async function handleInputChange() 
   {
      const keyword = inputSearch.value;

      // notice : need to have "/" then add "search"
      // to always get localhost:3000/search/suggest?inputKeyword=...
      fetch(`/search/suggest?inputKeyword=${keyword}`)
         .then(responseFromController => responseFromController.json())
         .then(dataFromController => {
            if(dataFromController.code == 200)
            {
               const htmlSuggestions = dataFromController.suggestions.map(eachSuggestion => {
                  return `
                     <a class="inner-item" href="/products/detail/${eachSuggestion.slug}">
                        <div class="inner-image">
                           <img src="${eachSuggestion.thumbnail}">
                        </div>
                        <div class="inner-info">
                           <div class="inner-title">
                              ${eachSuggestion.title}
                           </div>
                        </div>
                     </a>
                  `;
               });

               const elementInnerSuggest = boxSearch.querySelector(".inner-suggest");
               const elementInnerList = elementInnerSuggest.querySelector(".inner-list");

               elementInnerList.innerHTML = htmlSuggestions.join("");

               if(dataFromController.suggestions.length > 0) {
                  elementInnerSuggest.classList.add("show");
               }
               else {
                  elementInnerSuggest.classList.remove("show");
               }
            }
         })
   }

   inputSearch.addEventListener("input", debounce(handleInputChange, 500));
}
// ----- End suggestion box


// ----- Show notification BE
const notification = document.querySelector("[show-notification]");

if(notification)
{
   let timeExpiredNotification = notification.getAttribute("show-notification") || 3000;
   timeExpiredNotification = parseInt(timeExpiredNotification);

   // fadeInFE(notification); // thong bao BE ko nen dung fadeIn
   
   fadeOutBE(notification, timeExpiredNotification);
}
// ----- End show notification BE