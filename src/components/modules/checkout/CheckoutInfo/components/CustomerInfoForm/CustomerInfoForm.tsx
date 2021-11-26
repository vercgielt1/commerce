import { Form, Formik } from 'formik'
import React, { useEffect, useRef, useState } from 'react'
import { ButtonCommon, InputFiledInForm } from 'src/components/common'
import { useMessage } from 'src/components/contexts'
import { useModalAuthen } from 'src/components/contexts/ModalAuthen/ModalAuthenContext'
import { useModalCommon } from 'src/components/hooks'
import { useEditUserInfo } from 'src/components/hooks/account'
import { useActiveCustomer } from 'src/components/hooks/auth'
import { useSetCustomerForOrder } from 'src/components/hooks/order'
import { ErrorCode } from 'src/domains/enums/ErrorCode'
import { CommonError } from 'src/domains/interfaces/CommonError'
import { LANGUAGE } from 'src/utils/language.utils'
import { CustomInputCommon } from 'src/utils/type.utils'
import * as Yup from 'yup'
import ChekoutNotePolicy from '../ChekoutNotePolicy/ChekoutNotePolicy'
import s from './CustomerInfoForm.module.scss'
import ModalConfirmLogin from './ModalConfirmLogin/ModalConfirmLogin'
interface Props {
  id: number
  onConfirm: (id: number) => void
  activeStep: number

}

const ValidateNameObj = {
  firstName: Yup.string().required(LANGUAGE.MESSAGE.REQUIRED),
  lastName: Yup.string().required(LANGUAGE.MESSAGE.REQUIRED),
}

const displayingErrorMessagesWithEmailSchema = Yup.object().shape({
  ...ValidateNameObj,
  emailAddress: Yup.string().email(LANGUAGE.MESSAGE.INVALID_EMAIL).required(LANGUAGE.MESSAGE.REQUIRED),
})

const displayingErrorMessagesSchema = Yup.object().shape(ValidateNameObj)

const CustomerInfoForm = ({ id, onConfirm, activeStep }: Props) => {
  const firstNameRef = useRef<CustomInputCommon>(null)
  const emailRef = useRef<CustomInputCommon>(null)
  const { customer } = useActiveCustomer()
  const { setCustomerForOrder, loading } = useSetCustomerForOrder()
  const { editUserInfo } = useEditUserInfo()
  const { showMessageError } = useMessage()
  const [emailAddress, setEmailAddress] = useState<string>('')
  const { openModalAuthen } = useModalAuthen()
  const { visible: visibleModalConfirmLogin, closeModal: closeModalConfirmLogin, openModal: openModalConfirmLogin } = useModalCommon({ initialValue: false })
const formik = useRef(null)

  useEffect(() => {
    setTimeout(() => {
      firstNameRef.current?.focus()
    }, 500);
  }, [activeStep])

  const handleSubmit = (values: { firstName: string, lastName: string, emailAddress: string }) => {
    const { firstName, lastName, emailAddress } = values
    if (customer) {
      editUserInfo({ firstName, lastName }, onEditUserInfoCallBack)
    } else {
      setEmailAddress(emailAddress)
      setCustomerForOrder({ firstName, lastName, emailAddress }, onSubmitCalBack)
    }
  }

  const onEditUserInfoCallBack = (isSuccess: boolean, error?: string) => {
    if (isSuccess) {
      onConfirm(id)
    } else {
      showMessageError(error)
    }
  }

  const onSubmitCalBack = (isSuccess: boolean, error?: CommonError) => {
    if (isSuccess) {
      onConfirm(id)
    } else {
      if (error?.errorCode === ErrorCode.EmailAddressConflictError) {
        // show modal common
        openModalConfirmLogin()
      } else if (error?.errorCode === ErrorCode.NoActiveOrderError) {
        showMessageError("Your cart is empty! Please add items to the cart!")
      } else {
        showMessageError(error?.message)
      }
    }
  }
  const handleOpenModalLogin = () => {
    closeModalConfirmLogin()
    openModalAuthen(emailAddress)
  }

  const handleCloseModalConfirmLogin = () => {
    closeModalConfirmLogin()
    emailRef.current?.focus()
  }


  return (
    <section className={s.warpper}>
      <div className={s.body}>
        <Formik
          initialValues={{
            firstName: 'test',
            lastName: 'here',
            emailAddress: '',
          }}
          validationSchema={customer ? displayingErrorMessagesSchema : displayingErrorMessagesWithEmailSchema}
          onSubmit={handleSubmit}
          innerRef={formik}
        >
          {({ errors, touched, isValid, submitForm }) => (
            <Form className="u-form">
              <div className="body">
                <div className="line">
                  <InputFiledInForm
                    name="firstName"
                    placeholder="First name"
                    ref={firstNameRef}
                    error={
                      touched.firstName && errors.firstName
                        ? errors.firstName.toString()
                        : ''
                    }
                    isShowIconSuccess={touched.firstName && !errors.firstName}
                  />

                  <InputFiledInForm
                    name="lastName"
                    placeholder="Last name"
                    error={
                      touched.lastName && errors.lastName
                        ? errors.lastName.toString()
                        : ''
                    }
                    isShowIconSuccess={touched.lastName && !errors.lastName}
                  />
                </div>

                <InputFiledInForm
                  name="emailAddress"
                  placeholder="Email Address"
                  readOnly={customer ? true : false}
                  value={customer?.emailAddress}
                  error={
                    customer ? '' :
                      (touched.emailAddress && errors.emailAddress
                        ? errors.emailAddress.toString()
                        : '')
                  }
                  ref={emailRef}
                  isShowIconSuccess={touched.emailAddress && !errors.emailAddress}
                  onEnter={isValid ? submitForm : undefined}
                />
              </div>
              <div className={s.bottom}>
                <ChekoutNotePolicy />
                <ButtonCommon HTMLType='submit' loading={loading} size="large">
                  Continue to Shipping
                </ButtonCommon>
              </div>
            </Form>
          )}
        </Formik>
      </div>
      <ModalConfirmLogin visible={visibleModalConfirmLogin} closeModal={handleCloseModalConfirmLogin} handleOk={handleOpenModalLogin} email={emailAddress} />
    </section>
  )
}

export default CustomerInfoForm
