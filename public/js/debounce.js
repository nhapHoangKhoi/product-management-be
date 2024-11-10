export default function debounce(func, delay)
{
   let timeout = null;

   return (...args) => {
      clearTimeout(timeout);

      timeout = setTimeout(() => {
         func(...args);
      }, delay);
   };
}