/* ============================================================
   dialogs.js — Modal Dialogs & Image Lightbox
   Contact dialog, image preview dialog, and shared dialog logic.
   ============================================================ */

/* ---- Shared dialog setup ---- */
/* Wire up close button and click-outside-to-close for every <dialog> */
document.querySelectorAll('dialog').forEach(dialog => {
  // Close button (×)
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());

  // Click outside the dialog box to close (click on the backdrop area)
  dialog.addEventListener('click', e => {
    if (e.target === dialog) {
      const r = dialog.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right ||
          e.clientY < r.top  || e.clientY > r.bottom) {
        dialog.close();
      }
    }
  });

  // Remove scroll lock when dialog closes
  dialog.addEventListener('close', () => document.body.classList.remove('modal-open'));
});

/**
 * Open a <dialog> as a modal and lock body scroll.
 */
function openDialog(dialog) {
  dialog.showModal();
  document.body.classList.add('modal-open');
}

/**
 * Open the image lightbox with a given image source and title.
 */
function openImage(src, title) {
  $('#full-image').src = src;
  $('#full-image').alt = title;
  $('#image-caption').textContent = title;
  openDialog($('#image-dialog'));
}
