(function () {
  "use strict";

  var controls = document.getElementById("repository-controls");
  var searchInput = document.getElementById("repository-search");
  var languageFilter = document.getElementById("language-filter");
  var licenseFilter = document.getElementById("license-filter");
  var sortSelect = document.getElementById("sort-select");
  var viewButtons = Array.prototype.slice.call(
    document.querySelectorAll("[data-view]")
  );
  var tableSortButtons = Array.prototype.slice.call(
    document.querySelectorAll(".table-sort")
  );
  var cardView = document.getElementById("card-view");
  var tableView = document.getElementById("table-view");
  var cardContainer = document.getElementById("repository-grid");
  var tableBody = document.getElementById("repository-table-body");
  var resultCount = document.getElementById("result-count");
  var resultLabel = document.getElementById("result-label");
  var downloadButton = document.getElementById("download-csv");
  var emptyState = document.getElementById("empty-state");

  if (!controls || !cardContainer || !tableBody) {
    return;
  }

  var cards = Array.prototype.slice.call(
    document.querySelectorAll(".repository-card")
  );
  var rowsById = {};

  Array.prototype.forEach.call(
    document.querySelectorAll(".repository-row"),
    function (row) {
      rowsById[row.dataset.repositoryId] = row;
    }
  );

  var repositories = cards.map(function (card) {
    return {
      id: card.dataset.repositoryId,
      card: card,
      row: rowsById[card.dataset.repositoryId]
    };
  });

  var state = {
    view: "cards",
    sortKey: "updated",
    direction: "desc"
  };

  function normalizedValue(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function sortableValue(repository, key) {
    var value = repository.card.dataset[key] || "";

    if (["stars", "forks", "issues"].indexOf(key) !== -1) {
      return Number(value) || 0;
    }

    if (key === "updated") {
      return Date.parse(value) || 0;
    }

    return normalizedValue(value);
  }

  function compareRepositories(first, second) {
    var firstValue = sortableValue(first, state.sortKey);
    var secondValue = sortableValue(second, state.sortKey);
    var directionMultiplier = state.direction === "asc" ? 1 : -1;

    if (firstValue < secondValue) {
      return -1 * directionMultiplier;
    }

    if (firstValue > secondValue) {
      return 1 * directionMultiplier;
    }

    // A stable name fallback keeps ties predictable across both views.
    return normalizedValue(first.card.dataset.name).localeCompare(
      normalizedValue(second.card.dataset.name)
    );
  }

  function repositoryMatches(repository) {
    var query = normalizedValue(searchInput.value);
    var selectedLanguage = normalizedValue(languageFilter.value);
    var selectedLicense = normalizedValue(licenseFilter.value);
    var searchText = normalizedValue(repository.card.dataset.search);
    var language = normalizedValue(repository.card.dataset.language);
    var license = normalizedValue(repository.card.dataset.license);

    return (
      (!query || searchText.indexOf(query) !== -1) &&
      (!selectedLanguage || language === selectedLanguage) &&
      (!selectedLicense || license === selectedLicense)
    );
  }

  function csvCell(value) {
    var stringValue = value === undefined || value === null ? "" : String(value);

    // Quoting every cell safely preserves commas, quotes, and line breaks.
    return '"' + stringValue.replace(/"/g, '""') + '"';
  }

  function localDateStamp() {
    var today = new Date();
    var month = String(today.getMonth() + 1).padStart(2, "0");
    var day = String(today.getDate()).padStart(2, "0");

    return today.getFullYear() + "-" + month + "-" + day;
  }

  function downloadVisibleRepositories() {
    var visibleRepositories = repositories
      .slice()
      .sort(compareRepositories)
      .filter(repositoryMatches);
    var headers = [
      "name",
      "description",
      "is_fork",
      "language",
      "license",
      "updated_at",
      "stars",
      "forks",
      "open_issues",
      "url"
    ];
    var csvRows = visibleRepositories.map(function (repository) {
      var repositoryData = repository.card.dataset;

      return [
        repositoryData.exportName,
        repositoryData.description,
        repositoryData.isFork,
        repositoryData.language,
        repositoryData.license,
        repositoryData.updated,
        repositoryData.stars,
        repositoryData.forks,
        repositoryData.issues,
        repositoryData.url
      ];
    });
    var csvContent = [headers].concat(csvRows).map(function (row) {
      return row.map(csvCell).join(",");
    }).join("\r\n");
    var csvBlob = new Blob(["\ufeff", csvContent], {
      type: "text/csv;charset=utf-8"
    });
    var downloadUrl = URL.createObjectURL(csvBlob);
    var downloadLink = document.createElement("a");

    downloadLink.href = downloadUrl;
    downloadLink.download = "repositories-" + localDateStamp() + ".csv";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();

    // Revoke after the click is dispatched so the browser can read the blob.
    window.setTimeout(function () {
      URL.revokeObjectURL(downloadUrl);
    }, 0);
  }

  function updateSortControls() {
    tableSortButtons.forEach(function (button) {
      var isActive = button.dataset.sort === state.sortKey;
      var header = button.closest("th");

      button.classList.toggle("is-active", isActive);
      button.dataset.direction = isActive ? state.direction : "";
      header.setAttribute(
        "aria-sort",
        isActive
          ? state.direction === "asc"
            ? "ascending"
            : "descending"
          : "none"
      );
    });

    var matchingOption = state.sortKey + "-" + state.direction;
    if (sortSelect.querySelector('option[value="' + matchingOption + '"]')) {
      sortSelect.value = matchingOption;
    }
  }

  function updateRepositories() {
    var sortedRepositories = repositories.slice().sort(compareRepositories);
    var visibleCount = 0;

    sortedRepositories.forEach(function (repository) {
      var isVisible = repositoryMatches(repository);

      repository.card.hidden = !isVisible;
      repository.row.hidden = !isVisible;
      cardContainer.appendChild(repository.card);
      tableBody.appendChild(repository.row);

      if (isVisible) {
        visibleCount += 1;
      }
    });

    resultCount.textContent = visibleCount;
    resultLabel.textContent = visibleCount === 1 ? "repository" : "repositories";
    downloadButton.disabled = visibleCount === 0;
    emptyState.hidden = visibleCount !== 0;
    cardView.hidden = state.view !== "cards" || visibleCount === 0;
    tableView.hidden = state.view !== "table" || visibleCount === 0;
    updateSortControls();
  }

  function selectView(view) {
    state.view = view;

    viewButtons.forEach(function (button) {
      button.setAttribute("aria-pressed", button.dataset.view === view);
    });

    updateRepositories();
  }

  controls.addEventListener("submit", function (event) {
    event.preventDefault();
  });

  searchInput.addEventListener("input", updateRepositories);
  languageFilter.addEventListener("change", updateRepositories);
  licenseFilter.addEventListener("change", updateRepositories);
  downloadButton.addEventListener("click", downloadVisibleRepositories);

  sortSelect.addEventListener("change", function () {
    var sortParts = sortSelect.value.split("-");
    state.sortKey = sortParts[0];
    state.direction = sortParts[1];
    updateRepositories();
  });

  viewButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      selectView(button.dataset.view);
    });
  });

  tableSortButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      var nextSortKey = button.dataset.sort;

      if (state.sortKey === nextSortKey) {
        state.direction = state.direction === "asc" ? "desc" : "asc";
      } else {
        state.sortKey = nextSortKey;
        state.direction = ["name", "language", "license"].indexOf(nextSortKey) !== -1
          ? "asc"
          : "desc";
      }

      updateRepositories();
    });
  });

  updateRepositories();
})();
