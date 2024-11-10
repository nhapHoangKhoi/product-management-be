// console.log(prefixAdminJs);

tinymce.init({
   selector: 'textarea[textarea-mce]', // giong nhu cau lenh querySelector thoi
   license_key: 'gpl',
   promotion: false,
   statusbar: true,
   elementpath: false,
   branding: false,
   resize: true,
   plugins: 'lists link image table wordcount',

   images_upload_url: `/${prefixAdminJs}/upload` // ban chat la api thoi
});