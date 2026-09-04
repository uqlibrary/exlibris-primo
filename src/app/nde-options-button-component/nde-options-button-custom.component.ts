import { Component } from '@angular/core';
import {mouseoutTooltip, mouseoverTooltip} from "../shared/common";

@Component({
  selector: 'custom-nde-options-button-component',
  standalone: true,
  imports: [],
  templateUrl: './nde-options-button-custom.component.html',
  styleUrl: './nde-options-button-custom.component.scss'
})
export class NdeOptionsButtonCustom {
    ngOnInit(): void {
        const awaitOptionsButton = setInterval(() => {
            const optionsButton = document.querySelector('[aria-controls="expand-results-options-line"]');

            if (!optionsButton) { // button not ready yet
                return;
            }
            clearInterval(awaitOptionsButton);

            const optionsTooltipId = 'optionsbutton7649764';
            const optionsLabel = 'Options for more results';
            optionsButton.addEventListener('mouseover', function () {
                mouseoverTooltip(optionsButton, optionsLabel, optionsTooltipId, false);
            });
            optionsButton.addEventListener('focusin', function () {
                mouseoverTooltip(optionsButton, optionsLabel, optionsTooltipId, false);
            });
            optionsButton.addEventListener('mouseout', function () {
                mouseoutTooltip(optionsTooltipId);
            });
            optionsButton.addEventListener('focusout', function () {
                mouseoutTooltip(optionsTooltipId);
            });
        }, 100);
    }
}
