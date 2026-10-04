import React from "react";
import { createPortal } from "react-dom";
import {
  ConfirmationModal,
  type ChoiceOption,
  type ConfirmationModalProps,
} from "./ConfirmationModal";

// Based on https://github.com/MohamedKhalilHermassi/use-confirm-dialog/tree/main?tab=readme-ov-file
// License: MIT © Mohamed Khalil Hermassi

interface DialogOptionsBase extends Omit<
  ConfirmationModalProps,
  "onConfirm" | "onChoose" | "onCancel" | "children" | "isOpen" | "choices"
> {
  description: string;
}

export interface ConfirmOptions extends DialogOptionsBase {}

export interface ChooseOptions<T extends string> extends DialogOptionsBase {
  choices: ChoiceOption<T>[];
}

export type ConfirmFunction = (options: ConfirmOptions) => Promise<boolean>;
/** Resolves to the chosen `value`, or `null` if the user backed out. */
export type ChooseFunction = <T extends string>(
  options: ChooseOptions<T>,
) => Promise<T | null>;

interface ConfirmContextValue {
  confirm: ConfirmFunction;
  choose: ChooseFunction;
}

export const ConfirmContext = React.createContext<ConfirmContextValue | null>(
  null,
);

type PendingOptions = DialogOptionsBase & { choices?: ChoiceOption[] };

export const ConfirmProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [options, setOptions] = React.useState<PendingOptions | null>(null);
  // One resolver for both shapes: a confirm is just a choice between "yes"
  // and backing out, so the boolean variant maps onto the same machinery.
  const resolver = React.useRef<(value: string | null) => void>();

  const open = React.useCallback((next: PendingOptions) => {
    setOptions(next);
    return new Promise<string | null>(resolve => {
      resolver.current = resolve;
    });
  }, []);

  const close = React.useCallback((result: string | null) => {
    setOptions(null);
    resolver.current?.(result);
  }, []);

  const value = React.useMemo<ConfirmContextValue>(
    () => ({
      confirm: async confirmOptions =>
        (await open(confirmOptions)) === "confirm",
      choose: (async chooseOptions => open(chooseOptions)) as ChooseFunction,
    }),
    [open],
  );

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      {options &&
        createPortal(
          <ConfirmationModal
            {...options}
            isOpen={options !== null}
            onConfirm={() => close("confirm")}
            onChoose={choice => close(choice)}
            onCancel={() => close(null)}
          >
            {options.description}
          </ConfirmationModal>,
          document.body,
        )}
    </ConfirmContext.Provider>
  );
};

function useConfirmContext() {
  const context = React.useContext(ConfirmContext);
  if (!context) {
    throw new Error(
      "useConfirm/useChoose must be used within a ConfirmProvider.",
    );
  }
  return context;
}

/** Provides a `confirm` function.
 *
 * When calling the `confirm` function, a confirmation modal will be shown with the provided options.
 * The function returns a promise that resolves to `true` if the user confirms, and `false` if the user cancels.
 *
 * Must be used within a `ConfirmProvider`.
 *
 * Based on https://github.com/MohamedKhalilHermassi/use-confirm-dialog
 *
 * License: MIT © Mohamed Khalil Hermassi
 */
export const useConfirm = () => useConfirmContext().confirm;

/** The same dialog, but asking a question with more than two answers --
 * "this occurrence / this and following / all of them". Resolves to the
 * chosen `value`, or `null` if the user cancelled. */
export const useChoose = () => useConfirmContext().choose;
