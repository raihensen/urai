import classNames from "classnames";
import Button from "../button/Button";
import { Modal, type ModalProps } from "../modal/Modal";
import styles from "./ConfirmationModal.module.css";

/** One button in a multiple-choice dialog. `value` is what the promise
 * resolves to, so it is the caller's own union type rather than a label. */
export interface ChoiceOption<T extends string = string> {
  value: T;
  label: string;
  primary?: boolean;
  danger?: boolean;
}

export interface ConfirmationModalProps
  extends
    Pick<ModalProps, "isOpen">,
    Partial<Pick<ModalProps, "title" | "children">> {
  confirmText?: string;
  cancelText?: string;
  /** When given, the dialog asks a question with more than two answers --
   * the choices replace the single confirm button, and cancelling still
   * resolves to nothing. Stacked vertically, because these carry real
   * sentences ("This and all following events") rather than one verb. */
  choices?: ChoiceOption[];
  onConfirm: () => void;
  onChoose?: (value: string) => void;
  onCancel: () => void;
}

export const ConfirmationModal = (props: ConfirmationModalProps) => {
  const { choices } = props;
  return (
    <Modal
      isOpen={props.isOpen}
      close={props.onCancel}
      title={props.title ?? "Are you sure?"}
      footer={
        <div className={classNames(styles.footer, !!choices && styles.stacked)}>
          {choices ? (
            choices.map(choice => (
              <Button
                key={choice.value}
                primary={choice.primary}
                danger={choice.danger}
                onClick={() => props.onChoose?.(choice.value)}
              >
                {choice.label}
              </Button>
            ))
          ) : (
            <Button primary onClick={props.onConfirm}>
              {props.confirmText ?? "Confirm"}
            </Button>
          )}
          <Button onClick={props.onCancel}>
            {props.cancelText ?? "Cancel"}
          </Button>
        </div>
      }
    >
      {props.children}
    </Modal>
  );
};
