// to fetch index
  // Function to fetch images from the server
  
    // Function to fetch images from the server
    function fetchImages() {
      // Make a GET request to your backend's /images endpoint
      fetch('http://localhost:3000/api/images/images')
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to fetch images');
          }
          return response.json();
        })
        .then(images => {
          // Handle the received images data here
          console.log('Fetched images:', images);

          // You can loop through the images array and do something with each image
          images.forEach(image => {
            // Assuming each image has an "id" and "image_data" property
            const imageId = image.id;
            const imageData = image.image_data;

            // Call the displayImage function to display each image in a table row
            displayImage(imageId, imageData);
          });
        })
        .catch(error => {
          console.error('Error:', error.message);
        });
    }

    function displayImage(imageId, imageData) {
    // Create a table row
    const tableRow = document.createElement('tr');

    // Create a table data cell for the image
    const tableData = document.createElement('td');

    // Convert the binary image data to a Blob
    const uint8Array = new Uint8Array(imageData.data);
    const blob = new Blob([uint8Array], { type: 'image/jpeg' }); // Adjust the type as needed

    // Create an img element for the image
    const imgElement = document.createElement('img');
    imgElement.src = URL.createObjectURL(blob);

    // Set alt text for accessibility
    imgElement.alt = 'Image';

    // Append the img element to the table data cell
    tableData.appendChild(imgElement);

    // Create a delete button for the row
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';

    // Add an event listener to handle row deletion when the button is clicked
    deleteButton.addEventListener('click', () => {
        // Show a SweetAlert confirmation dialog
        Swal.fire({
            title: 'Delete Image',
            text: 'Are you sure you want to delete this image?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                // User confirmed the deletion, remove the row from the table
                tableRow.remove();

                // Send a DELETE request to your backend to delete the image based on imageId
                fetch(`http://localhost:3000/api/images/images/${imageId}`, {
  method: 'DELETE'
})

                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to delete image');
                    }
                    return response.json();
                })
                .then(data => {
                    // Handle the success response from the delete API if needed
                    console.log('Image deleted:', data);
                })
                .catch(error => {
                    console.error('Error deleting image:', error);
                });
            }
        });
    });

    // Create a table data cell for the delete button
    const deleteButtonCell = document.createElement('td');
    deleteButtonCell.appendChild(deleteButton);

    // Append the table data cell with the delete button to the table row
    tableRow.appendChild(tableData);
    tableRow.appendChild(deleteButtonCell);

    // Append the table row to the container for displaying images
    const imageContainer = document.getElementById('imageContainer');
    imageContainer.appendChild(tableRow);
    // Create a delete button for the row

    deleteButton.className = 'delete-button'; // Apply the CSS class

// Rest of your delete button creation code...

}


    // Call the fetchImages function to initiate the image fetching process
    fetchImages();




// const MAX_IMAGE_COUNT = 4; // Maximum allowed image count

// Initialize the image counter
const MAX_IMAGE_COUNT = 4; // Maximum allowed image count

// Initialize the image counter
let imageCounter = 0;

const imageForm = document.getElementById('imageForm');

imageForm.addEventListener('submit', (event) => {
  event.preventDefault();

  // Check the number of existing images before submitting
  fetch('http://localhost:3000/api/images/images')
    .then((response) => {
      if (!response.ok) {
        throw new Error('Failed to fetch images data');
      }
      return response.json();
    })
    .then((data) => {
      if (data.length >= MAX_IMAGE_COUNT) {
        // Display a SweetAlert warning message when the user tries to upload more than 4 images
        Swal.fire({
          title: 'Error',
          text: 'You can only upload up to 4 images. Please delete some images to make space for new ones.',
          icon: 'error',
        });
      } else {
        // If the image count is less than 4, proceed with the submission
        const formData = new FormData(imageForm);

        fetch('http://localhost:3000/api/images/images', {
          method: 'POST',
          body: formData,
        })
          .then((response) => {
            imageForm.reset();
            if (response.ok) {
              // Increment the image counter
              imageCounter++;
              return response.json();
            } else {
              throw new Error('POST request failed!');
            }
          })
          .then((data) => {
            // Process the response data here if needed
            console.log('POST request successful!', data);

            // Display a SweetAlert for successful upload
            Swal.fire({
              title: 'Success',
              text: 'Image uploaded successfully!',
              icon: 'success',
              confirmButtonText: 'OK',
            });

            // Show the confirmation message
            document.getElementById('popupModal').style.display = 'block';
          })
          .catch((error) => {
            console.error('Error:', error.message);
            // Handle the error scenario
          });
      }
    })
    .catch((error) => {
      console.error('Error:', error.message);
    });
});

document.getElementById('closeBtn').addEventListener('click', function () {
  // Close the confirmation message
  document.getElementById('popupModal').style.display = 'none';
});


// to list appoitments
const appointmentsPerPage = 5;
let currentAppointmentPage = 1;
let appointmentData = [];
let startingSerialNumber = 1;

function fetchAndPopulateAppointmentTable(page) {
  fetch('http://localhost:3000/api/appointment/appointments')
    .then(response => response.json())
    .then(data => {
      appointmentData = data;
      populateAppointmentTable(page);
    })
    .catch(error => {
      console.error('Failed to fetch appointments:', error);
    });
}

function populateAppointmentTable(page) {
  const tableBody = document.getElementById('appointmentTableBody');
  tableBody.innerHTML = '';

  const startIndex = (page - 1) * appointmentsPerPage;
  const endIndex = startIndex + appointmentsPerPage;

  for (let i = startIndex; i < endIndex && i < appointmentData.length; i++) {
    const appointment = appointmentData[i];
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
      <td>${startingSerialNumber}</td>
      <td>${appointment.name}</td>
      <td>${appointment.email}</td>
      <td>${appointment.location}</td>
      <td>${appointment.message}</td>
      <td>${appointment.contact_no}</td>
      <td>${appointment.date}</td>
      <td>${appointment.reference}</td>
      <td><button class="delete-btn" data-id="${appointment.id}">Delete</button></td>`;
    tableBody.appendChild(newRow);
    startingSerialNumber++;
  }

  const totalAppointmentPages = Math.ceil(appointmentData.length / appointmentsPerPage);
  document.getElementById('totalAppointmentPages').textContent = totalAppointmentPages;
  document.getElementById('currentAppointmentPage').textContent = page;
}

function prevAppointmentPage() {
  if (currentAppointmentPage > 1) {
    currentAppointmentPage--;
    startingSerialNumber = (currentAppointmentPage - 1) * appointmentsPerPage + 1;
    fetchAndPopulateAppointmentTable(currentAppointmentPage);
  }
}

function nextAppointmentPage() {
  const totalAppointmentPages = Math.ceil(appointmentData.length / appointmentsPerPage);
  if (currentAppointmentPage < totalAppointmentPages) {
    currentAppointmentPage++;
    startingSerialNumber = (currentAppointmentPage - 1) * appointmentsPerPage + 1;
    fetchAndPopulateAppointmentTable(currentAppointmentPage);
  }
}

fetchAndPopulateAppointmentTable(currentAppointmentPage);
 




// to list contacts
  const contactsPerPage = 10;
  let currentPage = 1;
  let data = [];
  let startingSerialNumberr = 1; // Initialize the starting serial number

  function fetchContacts() {
    fetch('http://localhost:3000/api/contactus/contacts')
      .then(response => response.json())
      .then(responseData => {
        data = responseData;
        fetchAndPopulateTable();
      })
      .catch(error => {
        console.error('Failed to fetch contacts:', error);
      });
  }

  function fetchAndPopulateTable() {
    const tableBody = document.getElementById('contactTableBody');
    tableBody.innerHTML = '';

    const startIndex = (currentPage - 1) * contactsPerPage;
    const endIndex = startIndex + contactsPerPage;

    for (let i = startIndex; i < endIndex && i < data.length; i++) {
      const contact = data[i];
      const newRow = document.createElement('tr');
      newRow.innerHTML = `
        <td>${startingSerialNumberr}</td>
        <td>${contact.name}</td>
        <td>${contact.email}</td>
        <td>${contact.phonenumber}</td>
        <td>${contact.message}</td>
        <td><button class="delete-btn" data-id="${contact.id}">Delete</button></td>
      `;
      tableBody.appendChild(newRow);
      startingSerialNumberr++;
    }

    const totalPages = Math.ceil(data.length / contactsPerPage);
    document.getElementById('totalPages').textContent = totalPages;
  }

  function prevPage() {
    if (currentPage > 1) {
      currentPage--;
      startingSerialNumberr = (currentPage - 1) * contactsPerPage + 1; // Update the starting serial number
      document.getElementById('currentPage').textContent = currentPage;
      fetchAndPopulateTable();
    }
  }

  function nextPage() {
    const totalPages = Math.ceil(data.length / contactsPerPage);
    if (currentPage < totalPages) {
      currentPage++;
      startingSerialNumberr = (currentPage - 1) * contactsPerPage + 1; // Update the starting serial number
      document.getElementById('currentPage').textContent = currentPage;
      fetchAndPopulateTable();
    }
  }

  // Attach the deleteContactEntry() function to the onclick event of each delete button
  document.getElementById('contactTableBody').addEventListener('click', function(event) {
    if (event.target && event.target.matches('button.delete-btn')) {
      const contactId = event.target.dataset.id;
      deleteContactEntry(contactId);
    }
  });

  function deleteContactEntry(id) {
    
    fetchAndPopulateTable();
  }

  fetchContacts();





//  to add pricing
  const pricingForm = document.getElementById('pricingForm');

  pricingForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(pricingForm);

    fetch('http://localhost:3000/api/pricing/pricing', {
      method: 'POST',
      body: formData,
    })
      .then((response) => {
        pricingForm.reset();
        if (response.ok) {
          return response.json(); // Parse the JSON data from the response
        } else {
          throw new Error('POST request failed!');
        }
      })
      .then((data) => {
        // Process the response data here if needed
        console.log('POST request successful!', data);
      })
      .catch((error) => {
        console.error('Error:', error.message);
        // Handle the error scenario
      });
  });








//    open edit modal for pricing
  function openEditModal(entryId) {
    const editModal = document.getElementById('editModal');
    editModal.style.display = 'block';
 
    fetch(`http://localhost:3000/api/pricing/pricings/${entryId}`)
      .then(response => response.json())
      .then(pricingEntry => {
        // Populate form fields with the retrieved data
        document.getElementById('editEntryId').value = pricingEntry.id;
        document.getElementById('editTitle').value = pricingEntry.title;
        document.getElementById('editSubtitle').value = pricingEntry.subtitle;
        document.getElementById('editTermsAndConditions').value = pricingEntry.terms_and_conditions;
        document.getElementById('editPrice').value = pricingEntry.price;

        // Show the edit modal
        document.getElementById('editModal').style.display = 'block';
      })
      .catch(error => {
        console.error('Error fetching pricing entry:', error);
      });
  }
  
  function closeEditModal() {
    const editModal = document.getElementById('editModal');
    editModal.style.display = 'none';
  }


//put method to save the changes for pricing
document.getElementById('pricingForm').addEventListener('submit', function(event) {
    event.preventDefault(); 
    console.log('Form submission handler called.');
    const formData = new FormData();
    formData.append('title', document.getElementById('editTitle').value);
    formData.append('subtitle', document.getElementById('editSubtitle').value);
    formData.append('terms_and_conditions', document.getElementById('editTermsAndConditions').value);
    formData.append('price', document.getElementById('editPrice').value);
    
    const entryId = document.getElementById('editEntryId').value; // Retrieve entryId from the hidden input field

    fetch(`http://localhost:3000/api/pricing/pricing/${entryId}`, {
      method: 'PUT',
      body: formData,
    })
    .then(response => response.json())
    .then(updatedData => {
      console.log('Entry updated:', updatedData);
      closeEditModal();
    })
    .catch(error => {
      console.error('Error updating entry:', error);
    });
});






// edit modal for pricing
  let currentEditEntryId = null; 
  function openAlbum(entryId) {
    currentEditEntryId = entryId;
    const addAlbumModal = document.getElementById('AddAlbum');
    addAlbumModal.style.display = 'block';
  
    addAlbumModal.querySelector('.modal-content').classList.add('show-modal');
  }
  
  function closeAlbum() {
    const addAlbumModal = document.getElementById('AddAlbum');
    const modalContent = addAlbumModal.querySelector('.modal-content');
    
   
    modalContent.classList.remove('show-modal');
    setTimeout(() => {
      addAlbumModal.style.display = 'none';
    }, 300); 
  }

  function saveAlbum() {
    var formElement = document.getElementById('addAlbum');
    var formData = new FormData(formElement);

    const sid = currentEditEntryId;

    formData.append('sid', sid);

    fetch(`http://localhost:3000/api/photos/photos/${sid}`, {
      method: 'POST',
      body: formData,
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('POST request failed!');
        }
      })
      .then((data) => {
        console.log('POST request successful!', data);
        formElement.reset();
        closeAlbum();
      })
      .catch((error) => {
        console.error('Error:', error.message);
      });
  }




  // Modify openStoriesModal function to populate the edit form
// Function to open the edit form and populate it with data
function openStoriesModal(storyId) {
    // Fetch the story data for the selected storyId
    fetch(`http://localhost:3000/api/stories/${storyId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch story data');
        }
        return response.json();
      })
      .then(data => {
        // Populate the edit form fields with the fetched data
        document.getElementById('editStoryId').value = storyId;
        document.getElementById('editStoryAlbum').value = data.album;
        document.getElementById('editStoryDate').value = data.Date;
        document.getElementById('editStoryTitle').value = data.title;
        document.getElementById('editStorySubtitle').value = data.subtitle;
  
        // Show the edit form
        document.getElementById('editFormContainer').style.display = 'block';
      })
      .catch(error => {
        console.error('Error:', error.message);
      });
  }
  
  // Function to handle form submission for updating the story
  document.getElementById('editStoryForm').addEventListener('submit', function (e) {
    e.preventDefault();
  
    // Get form data
    const formData = new FormData(document.getElementById('editStoryForm'));
    const storyId = formData.get('sid');
  
    // Send a PUT request to update the story
    fetch(`http://localhost:3000/api/stories/${storyId}`, {
      method: 'PUT',
      body: formData,
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to update story');
        }
        return response.json();
      })
      .then(data => {
        // Close the edit form
        document.getElementById('editFormContainer').style.display = 'none';
  
        // Refresh the stories list or update the edited story in the list
        fetchAndPopulateStoriesList();
      })
      .catch(error => {
        console.error('Error:', error.message);
      });
  });
  
  // Function to cancel the edit and hide the edit form
  function cancelEdit() {
    document.getElementById('editFormContainer').style.display = 'none';
  }
  
  
  
  //put method to save the changes
  document.getElementById('pricingForm').addEventListener('submit', function(event) {
      event.preventDefault();
      
      const formData = new FormData();
      formData.append('title', document.getElementById('editTitle').value);
      formData.append('subtitle', document.getElementById('editSubtitle').value);
      formData.append('terms_and_conditions', document.getElementById('editTermsAndConditions').value);
      formData.append('price', document.getElementById('editPrice').value);
      
      const entryId = document.getElementById('editEntryId').value; // Retrieve entryId from the hidden input field
  
      // Show a SweetAlert confirmation before making the PUT request
      swal({
          title: 'Confirm Update',
          text: 'Are you sure you want to save the changes?',
          icon: 'warning',
          buttons: true,
          dangerMode: true,
      }).then((willUpdate) => {
          if (willUpdate) {
              // Make the PUT request
              fetch(`http://localhost:3000/api/pricing/pricing/${entryId}`, {
                  method: 'PUT',
                  body: formData,
              })
              .then(response => response.json())
              .then(updatedData => {
                  // Show success message with SweetAlert
                  swal('Success', 'Entry updated successfully', 'success');
                  closeEditModal();
              })
              .catch(error => {
                  // Show error message with SweetAlert
                  swal('Error', 'Failed to update entry', 'error');
                  console.error('Error updating entry:', error);
              });
          }
      });
  });








// to delete appoitments
function deleteAppointmentEntry(id) {
  Swal.fire({
    title: 'Are you sure?',
    text: 'You will not be able to recover this appointment entry!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'No, cancel',
    reverseButtons: true,
    customClass: {
      popup: 'custom-sweet-alert',
    },
  }).then((result) => {
    if (result.isConfirmed) {
      fetch(`http://localhost:3000/api/appointment/appointment/${id}`, {
        method: 'DELETE',
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Failed to delete Appointment story entry');
          }
          return response.json();
        })
        .then((data) => {
          console.log('Appointment entry deleted successfully:', data);
          fetchAndPopulateTable();

          // Update the row indices
          const rows = document.querySelectorAll('#appointmentTableBody tr');

          // Get the index of the row to be deleted
          const deletedRowIndex = rows.indexOf(event.target.parentElement.parentElement);

          // Decrement the index number of all rows after the deleted row
          for (let i = deletedRowIndex + 1; i < rows.length; i++) {
            const row = rows[i];
            const indexCell = row.querySelector('.index-cell');
            if (indexCell) {
              indexCell.textContent = i;
            }
          }
        })
        .catch((error) => {
          console.error('Error:', error.message);
        });
    }
  });
}
  document.getElementById('appointmentTableBody').addEventListener('click', function (event) {
    if (event.target && event.target.matches('button.delete-btn')) {
      const appEntryId = event.target.dataset.id;
      deleteAppointmentEntry(appEntryId);
    }
  });

        

//  to delete contacts
  function deleteContactEntry(id) {
   // Use SweetAlert for confirmation
   Swal.fire({
     title: 'Are you sure?',
     text: 'You will not be able to recover this contact entry!',
     icon: 'warning',
     showCancelButton: true,
     confirmButtonText: 'Yes, delete it!',
     cancelButtonText: 'No, cancel',
     reverseButtons: true,
     customClass: {
         popup: 'custom-sweet-alert', // Add your custom class here
       },
   }).then((result) => {
     if (result.isConfirmed) {
       // User confirmed, proceed with deletion
       fetch(`http://localhost:3000/api/contact us/contact/${id}`, {
         method: 'DELETE',
       })
         .then((response) => {
           if (!response.ok) {
             throw new Error('Failed to delete Contact story entry');
           }
           return response.json();
         })
         .then((data) => {
           console.log('Contact entry deleted successfully:', data);
           // After successful deletion, re-fetch and populate the table
           fetchAndPopulateTable();
         })
         .catch((error) => {
           console.error('Error:', error.message);
         });
     }
   });
 }
 
 // Attach the deleteContactEntry() function to the onclick event of each delete button in the contact list
 document.getElementById('contactTableBody').addEventListener('click', function (event) {
   if (event.target && event.target.matches('button.delete-btn')) {
     const conEntryId = event.target.dataset.id;
     deleteContactEntry(conEntryId);
   }
 });
 

// to delete pricing
  function deletePricingEntry(id) {
   // Use SweetAlert for confirmation
   Swal.fire({
     title: 'Are you sure?',
     text: 'You will not be able to recover this pricing entry!',
     icon: 'warning',
     showCancelButton: true,
     confirmButtonText: 'Yes, delete it!',
     cancelButtonText: 'No, cancel',
     reverseButtons: true,
     customClass: {
         popup: 'custom-sweet-alert', // Add your custom class here
       },
   }).then((result) => {
     if (result.isConfirmed) {
       // User confirmed, proceed with deletion
       const url = `http://localhost:3000/api/pricing/pricing/${id}`;
       const method = 'DELETE';
 
       fetch(url, {
         method,
       })
         .then((response) => {
           if (!response.ok) {
             throw new Error('Failed to delete pricing entry');
           }
           return response.json();
         })
         .then((data) => {
           console.log('Pricing entry deleted successfully:', data);
           // After successful deletion, re-fetch and populate the pricing list
           fetchAndPopulatePricingList();
         })
         .catch((error) => {
           console.error('Error:', error.message);
         });
     }
   });
 }
 


// to delete stories
   function deleteStoryEntry(id) {
     // Use SweetAlert for confirmation
     Swal.fire({
       title: 'Are you sure?',
       text: 'You will not be able to recover this story entry!',
       icon: 'warning',
       showCancelButton: true,
       confirmButtonText: 'Yes, delete it!',
       cancelButtonText: 'No, cancel',
       reverseButtons: true,
       customClass: {
         popup: 'custom-sweet-alert', // Add your custom class here
       },
     }).then((result) => {
       if (result.isConfirmed) {
         // User confirmed, proceed with deletion
         fetch(`http://localhost:3000/api/stories/stories/${id}`, {
           method: 'DELETE',
         })
           .then((response) => {
             if (!response.ok) {
               throw new Error('Failed to delete story entry');
             }
             return response.json();
           })
           .then((data) => {
             console.log('Story entry deleted successfully:', data);
             // After successful deletion, re-fetch and populate the stories list
             fetchAndPopulateStoriesList();
           })
           .catch((error) => {
             console.error('Error:', error.message);
           });
       }
     });
   }
 
   // Attach the deleteStoryEntry() function to the onclick event of each delete button in the stories list
   document.getElementById('storiesListTableBody').addEventListener('click', function (event) {
     if (event.target && event.target.matches('button.delete-btn')) {
       const storyEntryId = event.target.dataset.id;
       deleteStoryEntry(storyEntryId);
     }
   });


 
