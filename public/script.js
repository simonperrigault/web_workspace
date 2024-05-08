let types = [];
let villes = [];
let allSorties = [];
let selectedSorties = [];

function selectFiltre() {
  console.log("appel à sel");
  selectedSorties = allSorties.filter(sortie => {
    let type = $("#selectType").val();
    let ville = $("#selectVille").val();
    let note = $("#selectNote").val();
    return (type === "tout" || sortie.type === type) && (ville === "tout" || sortie.ville === ville) && (note === "tout" || sortie.note === note);
  });

  $('#tableauResultat').empty();
  selectedSorties.forEach(sortie => {
    $('#tableauResultat').append(`
      <tr>
        <td><button class="croixSupprimer">X</button><span hidden>${sortie.id}</span</td>
        <td>${sortie.lieu}</td>
        <td>${sortie.type}</td>
        <td>${sortie.ville}</td>
        <td>${sortie.note}</td>
        <td>${sortie.commentaire}</td>
      </tr>
    `);
  });
}

function actualiserData() {
  console.log("appel à act");
  $.post('/api', {todo : "selectAll", table : "sorties"}, function(data){
    data.sort((a,b) => {return b.id - a.id});
    allSorties = data;
    selectedSorties = data;
    types = [...new Set(data.map(sortie => sortie.type))];
    villes = [...new Set(data.map(sortie => sortie.ville))];

    types.forEach(type => {
      $('#selectType').append(`<option value="${type}">${type}</option>`);
    });

    villes.forEach(ville => {
      $('#selectVille').append(`<option value="${ville}">${ville}</option>`);
    });

    data.forEach(sortie => {
      $('#tableauResultat').append(`
        <tr>
          <td><button class="croixSupprimer">X</button><span hidden>${sortie.id}</span</td>
          <td>${sortie.lieu}</td>
          <td>${sortie.type}</td>
          <td>${sortie.ville}</td>
          <td>${sortie.note}</td>
          <td>${sortie.commentaire}</td>
        </tr>
      `);
    });
    selectFiltre();
  })
}



$(document).ready(function () {
  actualiserData();
  
  // Attach click event handler to the parent element (e.g., the table)
  $('#tableauResultat').on('click', '.croixSupprimer', function() {
    // Get the id of the span associated with the clicked button
    var idLigne = $(this).next('span').text();
    // Use the id as needed
    $.ajax({
      url: '/api',
      method: 'POST',
      data: {todo : "delete", table : "sorties", id : idLigne},
      success: function (data) {
        console.log('Item deleted successfully:', data);
        actualiserData();
      },
      error: function (xhr, status, error) {
        console.error('There was a problem with the deletion:', xhr);
        console.error(error);
      }
    });
  });
  

  $('#formAjouter').on("submit", function (event) {
    // Prevent the default form submission
    event.preventDefault();

    // Serialize form data
    var formData = $(this).serialize();

    // Submit form data via AJAX
    $.ajax({
      url: '/api',
      method: 'POST',
      data: formData,
      success: function (data) {
        console.log('Form submitted successfully:', data);
        // Handle success response
        $("#pConfirmationAjout").html(`Élément ${data.lieu} ajouté avec succès`);
        actualiserData();
      },
      error: function (xhr, status, error) {
        console.error('There was a problem with the form submission:', error);
        // Handle error
      }
    });
  });

  $("#selectType, #selectVille, #selectNote").on("change", selectFiltre);
});