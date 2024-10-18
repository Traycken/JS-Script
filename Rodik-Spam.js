// ==UserScript==
// @name        Rodik spam
// @namespace   Rodik spaming
// @version      3.2.1
// @match       https://www.twitch.tv/r0dik*
// @grant       none
// @updateURL   https://raw.githubusercontent.com/Traycken/JS-Script/refs/heads/main/Rodik-Spam.js?token=GHSAT0AAAAAACR7YWIIIJWX5Y6XUBVNPZDCZYSLYCQ
// @downloadURL https://raw.githubusercontent.com/Traycken/JS-Script/refs/heads/main/Rodik-Spam.js?token=GHSAT0AAAAAACR7YWIIIJWX5Y6XUBVNPZDCZYSLYCQ
// ==/UserScript==

(function() {
    // test
    'use strict';

    // Charger les keyBindings depuis localStorage ou utiliser les valeurs par défaut
    const defaultBindings = {
        '1': 'viens',
        '2': 'tsap',
        '3': 'huhu',
        '4': 'tsin',
        '5': 'poukwa',
        '6': 'ccomb',
        '7': 'bokou+',
        '8': 'genou',
        '9': 'ticubi'
    };
    let keyBindings = JSON.parse(localStorage.getItem('keyBindings')) || defaultBindings;

    // Fonction pour sauvegarder les keyBindings dans localStorage
    function saveKeyBindings() {
        localStorage.setItem('keyBindings', JSON.stringify(keyBindings));
    }

    // Récupérer les valeurs du localStorage au chargement de la page
    let MaxRequiredPoints = localStorage.getItem('MaxRequiredPoints') || 10; // Valeur par défaut si aucune valeur stockée
    let SpamWait = localStorage.getItem('SpamWait') || 300; // Valeur par défaut si aucune valeur stockée

    // Fonction asynchrone pour attendre l'apparition d'un élément
    function waitForElement(selector, timeout = 500) {
        return new Promise((resolve, reject) => {

            const observer = new MutationObserver((mutationsList, observer) => {
                const element = document.querySelector(selector);
                if (element) {
                    observer.disconnect();
                    resolve(element);
                }
            });
            observer.observe(document.body, { childList: true, subtree: true });

            setTimeout(() => {
                observer.disconnect();
                reject(`Timeout: Element ${selector} not found`);
            }, timeout);
        });
    }

    let isRunning = false;  // Variable pour vérifier si une exécution est en cours

    // Simule un clic
    function simulateClick(element) {
        element.click();
    }


    let cachedButton1 = null; // Variable pour stocker le bouton une fois trouvé

    // Fonction asynchrone pour obtenir et stocker le bouton "Soldes de Bits et de points"
    async function getAndStoreButton1() {
        try {
            // Si cachedButton1 n'existe pas ou s'il a été retiré du DOM, on le cherche à nouveau
            if (!cachedButton1 || !document.body.contains(cachedButton1)) {
                cachedButton1 = await waitForElement('button[aria-label="Soldes de Bits et de points"]');
            }

            // À ce stade, cachedButton1 est valide et stocké, sans simuler un clic
            console.log('Button trouvé et stocké:', cachedButton1);
        } catch (error) {
            console.error('Erreur lors de la recherche du bouton:', error);
            // Relancer la recherche du bouton en cas d'échec
            getAndStoreButton1();
        }
    }


    // Fonction principale pour trouver et cliquer sur les boutons
    async function clickButton(targetText) {

        if (isRunning) {
            console.log("Le script est déjà en cours d'exécution, en attente...");
            return;  // Ne lance pas une nouvelle instance si déjà en cours
        }

        isRunning = true;  // Définir comme en cours d'exécution

        try {
            // Cliquer sur le premier bouton

            simulateClick(cachedButton1);

            // Attendre l'apparition de l'élément cible avec `targetText`
            const targetElement = await waitForElement(`p[title="${targetText}"]`);

            // Trouver et cliquer sur le deuxième bouton associé
            const button2 = targetElement.closest('div.Layout-sc-1xcs6mc-0.bHtdjj')
                                        .querySelector('button.ScInteractableBase-sc-ofisyf-0.ScInteractableDefault-sc-ofisyf-1.dsnvLR.etibmD.tw-interactable');
            if (button2) {
                simulateClick(button2);

                // Attendre l'apparition de l'élément avec id "channel-points-reward-center-body"
                await waitForElement('#channel-points-reward-center-body');

                // Attendre et cliquer sur le troisième bouton
                const button3 = document.querySelector('button.ScCoreButton-sc-ocjdkq-0.dJEfYL p.CoreText-sc-1txzju1-0');

                // Récupérer la valeur de RequiredPoints
                const priceElement = document.querySelector('div[data-test-selector="RequiredPoints"]').previousSibling;
                const requiredPoints = parseInt(priceElement.textContent.trim(), 10);

                // Vérifier si RequiredPoints est bien inférieur ou égal à MaxRequiredPoints
                if (requiredPoints <= MaxRequiredPoints) {
                    simulateClick(button3);
                } else {
                    // Afficher un popup si les points requis sont supérieurs au maximum autorisé
                    alert(`Le nombre de points requis (${requiredPoints}) dépasse le maximum autorisé (${MaxRequiredPoints}).`);

                    // Lever une exception contrôlée pour forcer le passage au finally
                    throw new Error("Points requis trop élevés");
                }

                // Fermer la fenêtre en cliquant sur le bouton de fermeture
                const button4 = await waitForElement('button.ScCoreButton-sc-ocjdkq-0.bmPBgZ.ScButtonIcon-sc-9yap0r-0.eSFFfM[aria-label="Fermer"]');
                simulateClick(button4);
            }
        } catch (error) {
            // Gestion des erreurs ou logs si besoin
            console.error(error);
        } finally {
            isRunning = false;  // Réinitialiser après la fin de l'exécution
        }
    }

    // Fonction pour générer dynamiquement le contenu de la fenêtre de notification
    function generateNotificationContent() {
        let content = '<strong>Menu des touches :</strong><ul style="list-style: none; padding: 0; margin: 0;">';
        content += `<li>Alt + F1 : Afficher les touches</li>`;
        content += `<li>Alt + F2 : Modifier les touches</li>`;
        for (const key in keyBindings) {
            content += `<li>Alt + ${key} : ${keyBindings[key]}</li>`;
        }
        content += '</ul>';
        return content;
    }

    // Fonction pour afficher une notification de type "toast"
    function showToast() {
        const toast = document.createElement('div');
        toast.style.position = 'fixed';
        toast.style.top = '20px';
        toast.style.left = '50%';
        toast.style.transform = 'translateX(-50%)';
        toast.style.padding = '10px 20px';
        toast.style.background = 'rgba(0, 0, 0, 0.8)';
        toast.style.color = '#fff';
        toast.style.fontSize = '14px';
        toast.style.borderRadius = '5px';
        toast.style.zIndex = '1000';
        toast.innerHTML = generateNotificationContent();

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 5000); // La notification disparaît après 5 secondes
    }

    // Fonction pour ouvrir un nouvel onglet avec une interface utilisateur pour modifier les keyBindings
    function openSettingsTab() {
        const win = window.open('', '_blank');
        win.document.write(`
            <html>
            <head>
                <title>Modifier les KeyBindings</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                    input { width: 100%; box-sizing: border-box; }
                    button { margin-top: 10px; padding: 10px 15px; }
                </style>
            </head>
            <body>
                <h1>Modifier les KeyBindings</h1>
                <table>
                    <thead>
                        <tr>
                            <th>Touche</th>
                            <th>Texte</th>
                        </tr>
                    </thead>
                    <tbody id="keyBindingsTable">
                        ${Object.keys(keyBindings).map(key => `
                            <tr>
                                <td><input type="text" data-key="${key}" value="${key}"></td>
                                <td><input type="text" data-value="${key}" value="${keyBindings[key]}"></td>
                                <td><button data-delete="${key}">Supprimer</button></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <button id="addButton">Ajouter une ligne</button>
                <button id="saveButton">Sauvegarder</button>
            </body>
            </html>
        `);

        // Ajouter un écouteur d'événement pour le bouton de sauvegarde
        win.document.getElementById('saveButton').addEventListener('click', () => {
            const inputsKey = win.document.querySelectorAll('input[data-key]');
            const inputsValue = win.document.querySelectorAll('input[data-value]');
            keyBindings = {};
            inputsKey.forEach((input, index) => {
                const key = input.value;
                const value = inputsValue[index].value;
                keyBindings[key] = value;
            });
            saveKeyBindings();
            win.close();
        });

        // Ajouter un écouteur d'événement pour le bouton d'ajout de ligne
        win.document.getElementById('addButton').addEventListener('click', () => {
            const table = win.document.getElementById('keyBindingsTable');
            const row = win.document.createElement('tr');
            row.innerHTML = `
                <td><input type="text" data-key="" value=""></td>
                <td><input type="text" data-value="" value=""></td>
                <td><button data-delete="">Supprimer</button></td>
            `;
            table.appendChild(row);

            // Ajouter l'écouteur d'événement pour le bouton de suppression
            row.querySelector('button[data-delete]').addEventListener('click', () => {
                row.remove();
            });
        });

        // Ajouter les écouteurs d'événement pour les boutons de suppression
        win.document.querySelectorAll('button[data-delete]').forEach(button => {
            button.addEventListener('click', (event) => {
                const key = button.getAttribute('data-delete');
                delete keyBindings[key];
                button.parentElement.parentElement.remove();
                saveKeyBindings();
            });
        });
    }

    // Fonction pour détecter l'appui sur la touche
    function handleKeyPress(event) {
        if (event.altKey && keyBindings[event.key]) {clickButton(keyBindings[event.key]);}
        if (event.altKey && event.key === 'F2') {openSettingsTab();}
        if (event.altKey && event.key === 'F1') {showToast();}
    }

    // Attacher l'écouteur d'événement pour les pressions de touches
    window.addEventListener('keydown', handleKeyPress);


    // Fonction pour supprimer tous les boutons dynamiques
    function removeButtons() {
        const targetDiv = document.querySelector('.channel-info-content');
        if (targetDiv) {
            // Supprimer tous les boutons enfants du targetDiv
            const buttons = targetDiv.querySelectorAll('button');
            buttons.forEach(button => button.remove());
        }
    }


    // Variable pour contrôler l'état de maintien du bouton
    let isHolding = false;

    // Créer les boutons dynamiques avant le contenu existant et les nommer selon les keyBindings
    function createButtons() {
        const targetDiv = document.querySelector('.channel-info-content');
        if (targetDiv) {
            const fragment = document.createDocumentFragment(); // Utiliser un fragment pour éviter les reflows

            // Créer et ajouter les boutons au fragment en fonction des keyBindings
            for (const key in keyBindings) {
                let button = document.createElement('button');
                button.innerText = keyBindings[key]; // Utiliser l'attribution comme nom du bouton

                // Style des boutons
                button.style.margin = '10px';
                button.style.padding = '10px 20px';
                button.style.border = '2px solid #772CE8'; // Contour bleu
                button.style.borderRadius = '10px'; // Coins arrondis
                button.style.backgroundColor = '#9146FF'; // Couleur de fond bleu foncé
                button.style.color = '#fff'; // Couleur du texte blanche
                button.style.fontSize = '16px';
                button.style.cursor = 'pointer';
                button.style.transition = 'background-color 0.3s, border-color 0.3s'; // Animation fluide

                // Effet de hover (survol)
                button.addEventListener('mouseover', function() {
                    button.style.backgroundColor = '#772CE8'; // Bleu plus clair au survol
                    button.style.borderColor = '#9146FF'; // Changement de contour au survol
                });

                // Effet inverse quand on ne survole plus
                button.addEventListener('mouseout', function() {
                    button.style.backgroundColor = '#9146FF'; // Retour à la couleur initiale
                    button.style.borderColor = '#772CE8'; // Retour au contour initial
                });

                // Fonction pour répéter l'exécution de clickButton tant que le bouton est maintenu
                async function handleButtonHold() {
                    while (isHolding) {
                        await clickButton(keyBindings[key]); // Attendre que la fonction se termine avant de relancer

                        // Attendre 1 seconde avant de relancer
                        await new Promise(resolve => setTimeout(resolve, SpamWait));
                    }
                }

                // Détection du maintien du bouton
                button.addEventListener('mousedown', function() {
                    isHolding = true; // Indiquer que le bouton est maintenu
                    handleButtonHold(); // Lancer la boucle d'exécution
                });

                // Arrêter la répétition lorsque le bouton est relâché
                button.addEventListener('mouseup', function() {
                    isHolding = false; // Arrêter la boucle d'exécution
                });

                // Aussi arrêter si la souris quitte le bouton
                button.addEventListener('mouseleave', function() {
                    isHolding = false; // Arrêter la boucle d'exécution
                });


                fragment.appendChild(button); // Ajouter le bouton au fragment
            }

            let settingsbutton = document.createElement('button');
            settingsbutton.innerText = "Settings"; // Utiliser l'attribution comme nom du bouton

            // Style des boutons
            settingsbutton.style.margin = '10px';
            settingsbutton.style.padding = '10px 20px';
            settingsbutton.style.border = '2px solid #0f4d0f'; // Contour bleu
            settingsbutton.style.borderRadius = '10px'; // Coins arrondis
            settingsbutton.style.backgroundColor = '#008000'; // Couleur de fond bleu foncé
            settingsbutton.style.color = '#fff'; // Couleur du texte blanche
            settingsbutton.style.fontSize = '16px';
            settingsbutton.style.cursor = 'pointer';
            settingsbutton.style.transition = 'background-color 0.3s, border-color 0.3s'; // Animation fluide

            // Effet de hover (survol)
            settingsbutton.addEventListener('mouseover', function() {
                settingsbutton.style.backgroundColor = '#0f4d0f'; // Bleu plus clair au survol
                settingsbutton.style.borderColor = '#008000'; // Changement de contour au survol
            });

            // Effet inverse quand on ne survole plus
            settingsbutton.addEventListener('mouseout', function() {
                settingsbutton.style.backgroundColor = '#008000'; // Retour à la couleur initiale
                settingsbutton.style.borderColor = '#0f4d0f'; // Retour au contour initial
            });

            // Associer les boutons aux keyBindings
            settingsbutton.addEventListener('click', function() {
                openSettingsTab();
            });

            fragment.appendChild(settingsbutton); // Ajouter le bouton au fragment

            let infobutton = document.createElement('button');
            infobutton.innerText = "Info"; // Utiliser l'attribution comme nom du bouton

            // Style des boutons
            infobutton.style.margin = '10px';
            infobutton.style.padding = '10px 20px';
            infobutton.style.border = '2px solid #0f4d0f'; // Contour bleu
            infobutton.style.borderRadius = '10px'; // Coins arrondis
            infobutton.style.backgroundColor = '#008000'; // Couleur de fond bleu foncé
            infobutton.style.color = '#fff'; // Couleur du texte blanche
            infobutton.style.fontSize = '16px';
            infobutton.style.cursor = 'pointer';
            infobutton.style.transition = 'background-color 0.3s, border-color 0.3s'; // Animation fluide

            // Effet de hover (survol)
            infobutton.addEventListener('mouseover', function() {
                infobutton.style.backgroundColor = '#0f4d0f'; // Bleu plus clair au survol
                infobutton.style.borderColor = '#008000'; // Changement de contour au survol
            });

            // Effet inverse quand on ne survole plus
            infobutton.addEventListener('mouseout', function() {
                infobutton.style.backgroundColor = '#008000'; // Retour à la couleur initiale
                infobutton.style.borderColor = '#0f4d0f'; // Retour au contour initial
            });

            // Associer les boutons aux keyBindings
            infobutton.addEventListener('click', function() {
                showToast();
            });

            fragment.appendChild(infobutton); // Ajouter le bouton au fragment

            // Créer le bouton de mise à jour à la fin
            let updateButton = document.createElement('button');
            updateButton.innerText = 'Refresh';

            // Style du bouton de mise à jour
            updateButton.style.margin = '10px';
            updateButton.style.padding = '10px 20px';
            updateButton.style.border = '2px solid #e74c3c'; // Contour rouge
            updateButton.style.borderRadius = '10px'; // Coins arrondis
            updateButton.style.backgroundColor = '#c0392b'; // Couleur de fond rouge foncé
            updateButton.style.color = '#fff'; // Couleur du texte blanche
            updateButton.style.fontSize = '16px';
            updateButton.style.cursor = 'pointer';
            updateButton.style.transition = 'background-color 0.3s, border-color 0.3s'; // Animation fluide

            // Effet de hover (survol)
            updateButton.addEventListener('mouseover', function() {
                updateButton.style.backgroundColor = '#e74c3c'; // Rouge plus clair au survol
                updateButton.style.borderColor = '#c0392b'; // Changement de contour au survol
            });

            // Effet inverse quand on ne survole plus
            updateButton.addEventListener('mouseout', function() {
                updateButton.style.backgroundColor = '#c0392b'; // Retour à la couleur initiale
                updateButton.style.borderColor = '#e74c3c'; // Retour au contour initial
            });

            // Associer le clic au bouton de mise à jour
            updateButton.addEventListener('click', function() {
                removeButtons(); // Supprimer les boutons existants
                createButtons(); // Recréer les boutons
            });

            fragment.appendChild(updateButton); // Ajouter le bouton de mise à jour au fragment

            // Insérer les boutons avant le premier enfant de targetDiv
            targetDiv.insertBefore(fragment, targetDiv.firstChild);
        } else {
            console.log('Le div cible n\'a pas été trouvé.');
        }
    }

    function createIncrement() {
        const targetDiv = document.querySelector('.channel-info-content');
        if (targetDiv) {
            const fragment = document.createDocumentFragment(); // Utiliser un fragment pour éviter les reflows

            // Ajouter les champs d'incrémentation pour MaxRequiredPoints et SpamWait
            let settingsDiv = document.createElement('div');
            settingsDiv.style.marginTop = '20px';

            // Création des champs d'incrémentation
            let maxRequiredPointsInput = document.createElement('input');
            maxRequiredPointsInput.type = 'number';
            maxRequiredPointsInput.value = MaxRequiredPoints; // Valeur actuelle de MaxRequiredPoints

            let spamWaitInput = document.createElement('input');
            spamWaitInput.type = 'number';
            spamWaitInput.value = SpamWait; // Valeur actuelle de SpamWait

            // Mettre à jour MaxRequiredPoints quand l'utilisateur change la valeur
            const maxPointsLabel = document.createElement('label');
            maxPointsLabel.innerText = 'Max Points: ';
            maxRequiredPointsInput.addEventListener('input', function() {
                MaxRequiredPoints = parseInt(maxRequiredPointsInput.value, 10);
                console.log(`MaxRequiredPoints mis à jour : ${MaxRequiredPoints}`);
                localStorage.setItem('MaxRequiredPoints', MaxRequiredPoints);
            });

            // Mettre à jour SpamWait quand l'utilisateur change la valeur
            const spamWaitLabel = document.createElement('label');
            spamWaitLabel.innerText = 'Spam Wait (ms): ';
            spamWaitInput.addEventListener('input', function() {
                SpamWait = parseInt(spamWaitInput.value, 10);
                console.log(`SpamWait mis à jour : ${SpamWait}`);
                localStorage.setItem('SpamWait', SpamWait);
            });

            // Appliquer le style similaire aux boutons
            [maxRequiredPointsInput, spamWaitInput].forEach(input => {
                input.style.margin = '10px';
                input.style.padding = '10px 20px';
                input.style.border = '2px solid #772CE8'; // Contour bleu
                input.style.borderRadius = '10px'; // Coins arrondis
                input.style.backgroundColor = '#9146FF'; // Couleur de fond bleu foncé
                input.style.color = '#fff'; // Couleur du texte blanche
                input.style.fontSize = '16px';
                input.style.cursor = 'pointer';
                input.style.transition = 'background-color 0.3s, border-color 0.3s'; // Animation fluide
                input.style.width = '100px'; // Largeur du champ
                input.style.textAlign = 'center'; // Centrer le texte dans le champ
            });

            // Ajouter les éléments au div de paramètres
            settingsDiv.appendChild(maxPointsLabel);
            settingsDiv.appendChild(maxRequiredPointsInput);
            settingsDiv.appendChild(spamWaitLabel);
            settingsDiv.appendChild(spamWaitInput);

            // Ajouter settingsDiv au fragment
            fragment.appendChild(settingsDiv);

            // Insérer les boutons avant le premier enfant de targetDiv
            targetDiv.insertBefore(fragment, targetDiv.firstChild);
        }
    }

    // Attendre que la page soit complètement chargée avant d'exécuter le script
    window.addEventListener('load', function() {
        createIncrement();
        createButtons();
        getAndStoreButton1();
});
})();
