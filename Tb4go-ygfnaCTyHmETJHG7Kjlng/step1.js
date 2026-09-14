(function goToStepNoElement() {
  const cardStepId = 'vD8s3dtxR2mfD2_-XQsPADie_5k';
  const createButtonStepId = 'tMUjjwzNn5-O6SNbDTD6-o9jrM0'; 
  const featurePageStepId = '1YvBHBL2na1M5RpIYV5vJ6uAcAw';
  const featurePageURLSegment = "/datamanager/";
    const sheetPageUrl = "/sheet/";
    const lastStepId = '79f89Yq8IuVU4lYQ8J3RPh6WEBY';
  const resourceGuideId = "7mL_jI1_v1Niv4OINB90_c_nZRE"; // fallback guide ID
  const noAccessStep = 2; // index 1 (step 2)
  const currentURL = window.location.pathname;
    const elementCardId = 'add-new-menu-item-create';
    
var guideSeenState = pendo.findGuideById('Tb4go-ygfnaCTyHmETJHG7Kjlng').steps.map(s => s.seenState)
    console.log(guideSeenState);
  // console.log("[Pendo] Current URL:", currentURL);
    
if (currentURL.includes(sheetPageUrl)) {
    var guideInProgress = pendo.findGuideById('Tb4go-ygfnaCTyHmETJHG7Kjlng').isInProgress(); //isn't this always going to be true, since its the current guide
    if (guideInProgress) {
        pendo.goToStep({ destinationStepId: lastStepId });
    } else {
        // do nothing, continue with the rest of the code below
    }
}
  if (currentURL.includes(featurePageURLSegment)) {
  //   console.log("[Pendo] URL matches feature page. Going to datamanager step:", featurePageStep);
    pendo.goToStep({destinationStepId: featurePageStepId});

  } else if (currentURL.includes('/analytics/create')) {
    // console.log("[Pendo] URL matches create page. Waiting briefly for DOM to load...");

    setTimeout(() => {
      const elementCard = document.getElementById(elementCardId);
   //   console.log("[Pendo] Checking for elementCard:", elementCard);

      if (elementCard ) {
    //     console.log("[Pendo] elementCard found. Going to cardStep:", cardStep);
        pendo.goToStep({destinationStepId: cardStepId});

      } else {
        // console.log("[Pendo] elementCard NOT found. Launching fallback guide:", resourceGuideId);
        pendo.showGuideById(resourceGuideId);

        setTimeout(() => {
          const guide = pendo.getActiveGuide().guide;

          if (guide && guide.id === resourceGuideId) {
            const step = guide.steps[noAccessStep - 1]; //replace with step id

            if (step) {
        //       console.log("[Pendo] Navigating to fallback step:", noAccessStep);
              pendo.goToStep({ destinationStepId: step.id });
            } else {
              // console.warn("[Pendo] Fallback step not found in guide.");
            }
          } else {
            // console.warn("[Pendo] Fallback guide did not load.");
          }
        }, 500);
      }
    }, 200);

  } else if (document.querySelector('[data-testid="nav-menu.analytics_creation.create"]')) {
   //  console.log("[Pendo] Create menu item is visible. Going to createButtonStep:", createButtonStep);
    pendo.goToStep({destinationStepId: createButtonStepId});

  } else {
    // console.log("[Pendo] Stay on step 1");
  }
})();
