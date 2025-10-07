        // Voting system
        let votes = {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0,
            6: 0
        };
        
        let hasVoted = false;

        function vote(candidateId) {
            if (hasVoted) {
                alert('Ya has votado. Solo se permite un voto por persona.');
                return;
            }
            
            votes[candidateId]++;
            hasVoted = true;
            
            // Update vote count display
            document.querySelectorAll('.votes-count').forEach((el, index) => {
                if (index + 1 === candidateId) {
                    el.textContent = votes[candidateId] + ' votos';
                }
            });
            
            // Disable all vote buttons
            document.querySelectorAll('.vote-btn').forEach(btn => {
                btn.disabled = true;
                btn.style.opacity = '0.6';
            });
            
            // Update results
            updateResults();
            
            // Show confirmation
            showConfetti();
            setTimeout(() => {
                document.getElementById('confirmation-modal').style.display = 'block';
            }, 1000);
        }
        
        function updateResults() {
            const resultsContainer = document.getElementById('results-container');
            resultsContainer.innerHTML = '';
            
            // Sort candidates by votes
            const sortedCandidates = Object.entries(votes)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3);
            
            const candidateNames = {
                1: 'Isabella Montoya',
                2: 'Sofía Valdez',
                3: 'Valentina Reyes',
                4: 'Camila Ortega',
                5: 'Lucía Mendoza',
                6: 'Gabriela Silva'
            };
            
            sortedCandidates.forEach(([id, voteCount], index) => {
                const medalIcons = ['🥇', '🥈', '🥉'];
                const resultItem = document.createElement('div');
                resultItem.className = 'flex items-center justify-between p-4 bg-purple-50 rounded-lg';
                resultItem.innerHTML = `
                    <div class="flex items-center space-x-4">
                        <span class="text-2xl">${medalIcons[index]}</span>
                        <span class="text-lg font-semibold text-purple-800">${candidateNames[id]}</span>
                    </div>
                    <span class="text-xl font-bold text-purple-700">${voteCount} votos</span>
                `;
                resultsContainer.appendChild(resultItem);
            });
        }
        
        function closeModal() {
            document.getElementById('confirmation-modal').style.display = 'none';
        }
        
        function showConfetti() {
            for (let i = 0; i < 100; i++) {
                createConfetti();
            }
        }
        
        function createConfetti() {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
            confetti.style.opacity = Math.random();
            document.body.appendChild(confetti);
            
            setTimeout(() => {
                confetti.remove();
            }, 5000);
        }
        
        // Close modal if clicked outside
        window.onclick = function(event) {
            const modal = document.getElementById('confirmation-modal');
            if (event.target === modal) {
                closeModal();
            }
        }
        
        // Initialize results
        updateResults();
    
