document.addEventListener('DOMContentLoaded', function() {
    const projectCards = Array.from(document.querySelectorAll('.project-card'));
    if (projectCards.length === 0) {
        console.log('No project cards found. Project filtering script will not run.');
        return;
    }

    const tagFiltersContainer = document.getElementById('tag-filters');
    const technologyFiltersContainer = document.getElementById('technology-filters');
    const statusFilter = document.getElementById('status-filter');
    const keywordSearchInput = document.getElementById('keyword-search-input');
    const sortOptions = document.getElementById('sort-options');
    const projectGrid = document.querySelector('.projects.grid'); // More specific selector

    if (!tagFiltersContainer || !technologyFiltersContainer || !statusFilter || !keywordSearchInput || !sortOptions || !projectGrid) {
        console.error('One or more filter/sort controls or the project grid was not found. Script will not run.');
        return;
    }

    const projectsData = projectCards.map(card => card.dataset);

    populateFilters(projectsData, tagFiltersContainer, 'tags');
    populateFilters(projectsData, technologyFiltersContainer, 'technologies');

    statusFilter.addEventListener('change', applyFiltersAndSort);
    keywordSearchInput.addEventListener('input', applyFiltersAndSort); // 'input' for real-time search
    sortOptions.addEventListener('change', applyFiltersAndSort);

    // populateFilters will add listeners to dynamically created checkboxes

    // Initial application of filters (e.g. if a filter is pre-selected) and sorting
    applyFiltersAndSort();

    function populateFilters(projectsData, container, attributeName) {
        const allItems = new Set();
        projectsData.forEach(project => {
            const items = project[attributeName] ? project[attributeName].split(',') : [];
            items.forEach(item => {
                const trimmedItem = item.trim().toLowerCase();
                if (trimmedItem) {
                    allItems.add(trimmedItem);
                }
            });
        });

        const sortedItems = Array.from(allItems).sort();

        sortedItems.forEach(item => {
            const checkboxId = `${attributeName}-${item.replace(/\s+/g, '-')}`; // Create a safe ID

            const formCheckDiv = document.createElement('div');
            formCheckDiv.classList.add('form-check');

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.classList.add('form-check-input');
            checkbox.value = item;
            checkbox.id = checkboxId;
            checkbox.addEventListener('change', applyFiltersAndSort);

            const label = document.createElement('label');
            label.classList.add('form-check-label');
            label.htmlFor = checkboxId;
            label.textContent = item.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '); // Capitalize for display

            formCheckDiv.appendChild(checkbox);
            formCheckDiv.appendChild(label);
            container.appendChild(formCheckDiv);
        });
    }

    function applyFiltersAndSort() {
        const selectedTags = Array.from(tagFiltersContainer.querySelectorAll('input[type="checkbox"]:checked'))
            .map(cb => cb.value.toLowerCase());
        const selectedTechnologies = Array.from(technologyFiltersContainer.querySelectorAll('input[type="checkbox"]:checked'))
            .map(cb => cb.value.toLowerCase());
        const selectedStatus = statusFilter.value.toLowerCase();
        const keyword = keywordSearchInput.value.toLowerCase().trim();
        const sortCriteria = sortOptions.value;

        let filteredProjects = [...projectCards]; // Start with all project card DOM elements

        // Keyword filter (title and short description)
        if (keyword) {
            filteredProjects = filteredProjects.filter(card => {
                const title = card.dataset.title ? card.dataset.title.toLowerCase() : '';
                const description = card.dataset.shortDescription ? card.dataset.shortDescription.toLowerCase() : '';
                return title.includes(keyword) || description.includes(keyword);
            });
        }

        // Status filter
        if (selectedStatus !== 'all') {
            filteredProjects = filteredProjects.filter(card => 
                card.dataset.status && card.dataset.status.toLowerCase() === selectedStatus
            );
        }

        // Tags filter
        if (selectedTags.length > 0) {
            filteredProjects = filteredProjects.filter(card => {
                const projectTags = card.dataset.tags ? card.dataset.tags.toLowerCase().split(',') : [];
                return selectedTags.some(selectedTag => projectTags.includes(selectedTag.trim()));
            });
        }

        // Technologies filter
        if (selectedTechnologies.length > 0) {
            filteredProjects = filteredProjects.filter(card => {
                const projectTechs = card.dataset.technologies ? card.dataset.technologies.toLowerCase().split(',') : [];
                return selectedTechnologies.some(selectedTech => projectTechs.includes(selectedTech.trim()));
            });
        }

        // Sorting
        filteredProjects.sort((a, b) => {
            switch (sortCriteria) {
                case 'start_date_newest':
                    return (b.dataset.startDate || 0) - (a.dataset.startDate || 0);
                case 'start_date_oldest':
                    return (a.dataset.startDate || 0) - (b.dataset.startDate || 0);
                case 'title_az':
                    const titleA = a.dataset.title || '';
                    const titleB = b.dataset.title || '';
                    return titleA.localeCompare(titleB);
                case 'default':
                default:
                    return (a.dataset.order || 999) - (b.dataset.order || 999);
            }
        });

        // Update DOM
        // First, hide all original projectCards by detaching them (or setting display none)
        projectCards.forEach(card => card.style.display = 'none');

        // Then, append the filtered and sorted cards back to the grid
        // This also re-orders them in the DOM
        filteredProjects.forEach(card => {
            card.style.display = ''; // Or 'block', or whatever its original display was
            projectGrid.appendChild(card);
        });

        // TODO: Add Masonry update call here if applicable
        // e.g., if (window.msnry) { window.msnry.reloadItems(); window.msnry.layout(); }
        // or if using jQuery: $(projectGrid).masonry('reloadItems').masonry('layout');
    }
});
