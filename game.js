
        // Game state
        const gameState = {
            fuel: 100,
            maxFuel: 100,
            distance: 0,
            maxDistance: 100,
            weight: 100,
            cargoDelivered: 0,
            cargoRequired: 50,
            shipIntegrity: 100,
            phase: 'decision', // 'decision' or 'travel'
            cargo: [
                { id: 1, name: "Food Supplies", value: 10, weight: 15, jettisoned: false },
                { id: 2, name: "Medical Equipment", value: 20, weight: 10, jettisoned: false },
                { id: 3, name: "Luxury Goods", value: 30, weight: 5, jettisoned: false },
                { id: 4, name: "Construction Materials", value: 15, weight: 20, jettisoned: false },
                { id: 5, name: "Scientific Instruments", value: 25, weight: 10, jettisoned: false }
            ],
            shipParts: [
                { id: 1, name: "Shields", icon: "🛡️", weight: 15, active: true },
                { id: 2, name: "Scanner", icon: "📡", weight: 10, active: true },
                { id: 3, name: "Thrusters", icon: "🚀", weight: 20, active: true },
                { id: 4, name: "Life Support", icon: "💨", weight: 15, active: true },
                { id: 5, name: "Cargo Bay", icon: "📦", weight: 10, active: true }
            ],
            events: [
                {
                    title: "Asteroid Field!",
                    description: "Your ship is entering a dangerous asteroid field. Without shields, you'll take damage.",
                    choices: [
                        { text: "Use extra fuel to navigate safely", fuelCost: 15, damage: 0 },
                        { text: "Risk it and hope for the best", fuelCost: 5, damage: 30 }
                    ]
                },
                {
                    title: "Space Pirates!",
                    description: "Pirates are demanding cargo. You can try to outrun them or negotiate.",
                    choices: [
                        { text: "Use thrusters to escape", fuelCost: 20, cargoLoss: 0 },
                        { text: "Negotiate and give up some cargo", fuelCost: 5, cargoLoss: 2 }
                    ]
                },
                {
                    title: "Gravity Well",
                    description: "Your ship is caught in a gravity well. You need extra power to break free.",
                    choices: [
                        { text: "Use maximum thrust", fuelCost: 25, damage: 0 },
                        { text: "Try a risky maneuver", fuelCost: 10, damage: 15 }
                    ]
                }
            ],
            currentEvent: null,
            score: 0
        };

        // DOM Elements
        const fuelValue = document.getElementById('fuel-value');
        const fuelBar = document.getElementById('fuel-bar');
        const distanceValue = document.getElementById('distance-value');
        const distanceBar = document.getElementById('distance-bar');
        const weightValue = document.getElementById('weight-value');
        const cargoDelivered = document.getElementById('cargo-delivered');
        const integrityValue = document.getElementById('integrity-value');
        const shipPartsContainer = document.getElementById('ship-parts');
        const cargoList = document.getElementById('cargo-list');
        const decisionPanel = document.getElementById('decision-panel');
        const eventPanel = document.getElementById('event-panel');
        const eventTitle = document.getElementById('event-title');
        const eventDescription = document.getElementById('event-description');
        const eventChoice1 = document.getElementById('event-choice-1');
        const eventChoice2 = document.getElementById('event-choice-2');
        const gameOverScreen = document.getElementById('game-over');
        const gameOverTitle = document.getElementById('game-over-title');
        const gameOverMessage = document.getElementById('game-over-message');
        const finalScore = document.getElementById('final-score');
        const restartBtn = document.getElementById('restart-btn');
        const optionCargo = document.getElementById('option-cargo');
        const optionParts = document.getElementById('option-parts');
        const phaseDecision = document.getElementById('phase-decision');
        const phaseTravel = document.getElementById('phase-travel');
        const shipContainer = document.getElementById('ship-container');
        const spaceJourney = document.getElementById('space-journey');
        const starsContainer = document.getElementById('stars');

        // Initialize the game
        function initGame() {
            updateUI();
            renderShipParts();
            renderCargo();
            createStars();
            updateShipPosition();
            
            // Event listeners
            optionCargo.addEventListener('click', () => showCargoSelection());
            optionParts.addEventListener('click', () => showPartsSelection());
            eventChoice1.addEventListener('click', () => handleEventChoice(0));
            eventChoice2.addEventListener('click', () => handleEventChoice(1));
            restartBtn.addEventListener('click', resetGame);
        }

        // Create background stars
        function createStars() {
            starsContainer.innerHTML = '';
            for (let i = 0; i < 50; i++) {
                const star = document.createElement('div');
                star.className = 'star';
                star.style.width = `${Math.random() * 3 + 1}px`;
                star.style.height = star.style.width;
                star.style.left = `${Math.random() * 100}%`;
                star.style.top = `${Math.random() * 100}%`;
                star.style.animationDelay = `${Math.random() * 3}s`;
                starsContainer.appendChild(star);
            }
        }

        // Update ship position based on distance
        function updateShipPosition() {
            const journeyWidth = spaceJourney.offsetWidth - 140; // Account for planet sizes
            const progress = gameState.distance / gameState.maxDistance;
            const newPosition = 110 + (journeyWidth * progress);
            shipContainer.style.left = `${newPosition}px`;
        }

        // Update the UI with current game state
        function updateUI() {
            // Update fuel
            fuelValue.textContent = `${gameState.fuel}%`;
            fuelBar.style.width = `${gameState.fuel}%`;
            
            // Update distance
            distanceValue.textContent = `${gameState.distance}/${gameState.maxDistance}`;
            distanceBar.style.width = `${(gameState.distance / gameState.maxDistance) * 100}%`;
            
            // Update weight
            weightValue.textContent = `${gameState.weight}%`;
            
            // Update cargo delivered
            cargoDelivered.textContent = `${gameState.cargoDelivered}/${gameState.cargoRequired}`;
            
            // Update ship integrity
            integrityValue.textContent = `${gameState.shipIntegrity}%`;
            
            // Update phase indicator
            if (gameState.phase === 'decision') {
                phaseDecision.classList.add('active');
                phaseTravel.classList.remove('active');
            } else {
                phaseDecision.classList.remove('active');
                phaseTravel.classList.add('active');
            }
            
            // Update ship position
            updateShipPosition();
        }

        // Render ship parts
        function renderShipParts() {
            shipPartsContainer.innerHTML = '';
            gameState.shipParts.forEach(part => {
                const partElement = document.createElement('div');
                partElement.className = `ship-part ${part.active ? '' : 'jettisoned'}`;
                partElement.innerHTML = `
                    <div class="ship-part-icon">${part.icon}</div>
                    <div>${part.name}</div>
                    <div>${part.weight}% weight</div>
                `;
                
                if (part.active) {
                    partElement.addEventListener('click', () => jettisonPart(part.id));
                }
                
                shipPartsContainer.appendChild(partElement);
            });
        }

        // Render cargo items
        function renderCargo() {
            cargoList.innerHTML = '';
            gameState.cargo.forEach(item => {
                if (!item.jettisoned) {
                    const cargoElement = document.createElement('div');
                    cargoElement.className = 'cargo-item';
                    cargoElement.innerHTML = `
                        <span>${item.name} (Value: ${item.value}, Weight: ${item.weight}%)</span>
                        <button class="jettison-btn" data-id="${item.id}">Jettison</button>
                    `;
                    cargoList.appendChild(cargoElement);
                }
            });
            
            // Add event listeners to jettison buttons
            document.querySelectorAll('.jettison-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = parseInt(e.target.getAttribute('data-id'));
                    jettisonCargo(id);
                });
            });
        }

        // Show cargo selection for jettisoning
        function showCargoSelection() {
            // In a full implementation, this would highlight cargo items
            // For now, we'll just jettison a random cargo item
            const availableCargo = gameState.cargo.filter(item => !item.jettisoned);
            if (availableCargo.length > 0) {
                const randomIndex = Math.floor(Math.random() * availableCargo.length);
                jettisonCargo(availableCargo[randomIndex].id);
            }
        }

        // Show parts selection for jettisoning
        function showPartsSelection() {
            // In a full implementation, this would highlight ship parts
            // For now, we'll just jettison a random ship part
            const availableParts = gameState.shipParts.filter(part => part.active);
            if (availableParts.length > 0) {
                const randomIndex = Math.floor(Math.random() * availableParts.length);
                jettisonPart(availableParts[randomIndex].id);
            }
        }

        // Jettison a cargo item
        function jettisonCargo(id) {
            const cargoItem = gameState.cargo.find(item => item.id === id);
            if (cargoItem && !cargoItem.jettisoned) {
                cargoItem.jettisoned = true;
                gameState.weight -= cargoItem.weight;
                
                // Visual effect
                const cargoElement = document.querySelector(`.jettison-btn[data-id="${id}"]`).parentElement;
                const rect = cargoElement.getBoundingClientRect();
                createFloatingCargo(rect.left, rect.top, cargoItem.name);
                
                // Update UI
                renderCargo();
                updateUI();
                
                // Move to travel phase after a delay
                setTimeout(startTravelPhase, 1000);
            }
        }

        // Jettison a ship part
        function jettisonPart(id) {
            const part = gameState.shipParts.find(p => p.id === id);
            if (part && part.active) {
                part.active = false;
                gameState.weight -= part.weight;
                
                // Visual effect
                const partElement = document.querySelectorAll('.ship-part')[id-1];
                createShipDamage(partElement.getBoundingClientRect().left, partElement.getBoundingClientRect().top);
                
                // Update UI
                renderShipParts();
                updateUI();
                
                // Move to travel phase after a delay
                setTimeout(startTravelPhase, 1000);
            }
        }

        // Create floating cargo animation
        function createFloatingCargo(x, y, name) {
            const floatingCargo = document.createElement('div');
            floatingCargo.className = 'cargo-floating';
            floatingCargo.textContent = '📦';
            floatingCargo.style.left = `${x}px`;
            floatingCargo.style.top = `${y}px`;
            document.body.appendChild(floatingCargo);
            
            setTimeout(() => {
                document.body.removeChild(floatingCargo);
            }, 2000);
        }

        // Create ship damage animation
        function createShipDamage(x, y) {
            const damage = document.createElement('div');
            damage.className = 'ship-damage';
            damage.textContent = '💥';
            damage.style.left = `${x}px`;
            damage.style.top = `${y}px`;
            document.body.appendChild(damage);
            
            setTimeout(() => {
                document.body.removeChild(damage);
            }, 500);
        }

        // Start the travel phase
        function startTravelPhase() {
            gameState.phase = 'travel';
            updateUI();
            
            // Hide decision panel, show event panel
            decisionPanel.classList.add('hidden');
            eventPanel.classList.remove('hidden');
            
            // Trigger a random event
            triggerRandomEvent();
        }

        // Trigger a random event
        function triggerRandomEvent() {
            const randomEventIndex = Math.floor(Math.random() * gameState.events.length);
            gameState.currentEvent = gameState.events[randomEventIndex];
            
            eventTitle.textContent = gameState.currentEvent.title;
            eventDescription.textContent = gameState.currentEvent.description;
            eventChoice1.textContent = gameState.currentEvent.choices[0].text;
            eventChoice2.textContent = gameState.currentEvent.choices[1].text;
        }

        // Handle event choice
        function handleEventChoice(choiceIndex) {
            const choice = gameState.currentEvent.choices[choiceIndex];
            
            // Apply fuel cost
            gameState.fuel -= choice.fuelCost;
            
            // Apply damage if any
            if (choice.damage) {
                gameState.shipIntegrity -= choice.damage;
            }
            
            // Apply cargo loss if any
            if (choice.cargoLoss) {
                // In a full implementation, this would remove specific cargo
                // For now, we'll just reduce the cargo delivered count
                gameState.cargoDelivered = Math.max(0, gameState.cargoDelivered - choice.cargoLoss);
            }
            
            // Update UI
            updateUI();
            
            // Check for game over
            if (gameState.fuel <= 0 || gameState.shipIntegrity <= 0) {
                endGame(false);
                return;
            }
            
            // Move forward
            gameState.distance += 20;
            
            // Check if destination reached
            if (gameState.distance >= gameState.maxDistance) {
                endGame(true);
                return;
            }
            
            // Return to decision phase
            setTimeout(() => {
                gameState.phase = 'decision';
                decisionPanel.classList.remove('hidden');
                eventPanel.classList.add('hidden');
                updateUI();
            }, 1500);
        }

        // End the game
        function endGame(success) {
            // Calculate score
            let score = gameState.cargoDelivered * 10;
            if (success) {
                score += 100; // Bonus for reaching destination
                score += gameState.fuel; // Bonus for remaining fuel
                score += gameState.shipIntegrity; // Bonus for ship integrity
            }
            
            gameState.score = score;
            
            // Show game over screen
            gameOverScreen.classList.remove('hidden');
            if (success) {
                gameOverTitle.textContent = "Mission Successful!";
                gameOverMessage.textContent = `You delivered ${gameState.cargoDelivered} units of cargo to the planet.`;
            } else {
                if (gameState.fuel <= 0) {
                    gameOverTitle.textContent = "Out of Fuel!";
                    gameOverMessage.textContent = "Your ship ran out of fuel before reaching the destination.";
                } else {
                    gameOverTitle.textContent = "Ship Destroyed!";
                    gameOverMessage.textContent = "Your ship sustained too much damage to continue.";
                }
            }
            finalScore.textContent = score;
        }

        // Reset the game
        function resetGame() {
            // Reset game state
            gameState.fuel = 100;
            gameState.distance = 0;
            gameState.weight = 100;
            gameState.cargoDelivered = 0;
            gameState.shipIntegrity = 100;
            gameState.phase = 'decision';
            gameState.score = 0;
            
            // Reset cargo
            gameState.cargo.forEach(item => {
                item.jettisoned = false;
            });
            
            // Reset ship parts
            gameState.shipParts.forEach(part => {
                part.active = true;
            });
            
            // Hide game over screen
            gameOverScreen.classList.add('hidden');
            
            // Show decision panel
            decisionPanel.classList.remove('hidden');
            eventPanel.classList.add('hidden');
            
            // Update UI
            updateUI();
            renderShipParts();
            renderCargo();
        }

        // Initialize the game when the page loads
        window.addEventListener('load', initGame);
