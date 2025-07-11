<script setup lang="ts">
import {Connect} from "@/types";
import {EmailService} from "@/mailService";
import {computed, ref} from "vue";

defineProps<{
  data: Connect
}>()

const name = ref<string>('');
const email = ref<string>('');
const telephone = ref<string>('');
const budget = ref<string>('');
const offer = ref<string[]>([]);
const description = ref<string>('');

const success = ref<boolean>(false);
const error = ref<boolean>(false);

// Validation states
const nameError = ref<string>('');
const emailError = ref<string>('');
const offerError = ref<string>('');
const descriptionError = ref<string>('');

const text = computed(() => {
  return `${name.value} - ${email.value} ${(telephone.value ? ' - ' + telephone.value : '')} \n BUDGET: ${budget.value}\n SERVICES: ${offer.value.join(', ')} \n DESCRIPTION:\n ${description.value}`
})

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Validation functions
const validateName = () => {
  if (!name.value.trim()) {
    nameError.value = 'Name is required';
    return false;
  }
  if (name.value.trim().length < 2) {
    nameError.value = 'Name must be at least 2 characters';
    return false;
  }
  nameError.value = '';
  return true;
}

const validateEmail = () => {
  if (!email.value.trim()) {
    emailError.value = 'Email is required';
    return false;
  }
  if (!emailRegex.test(email.value.trim())) {
    emailError.value = 'Please enter a valid email address';
    return false;
  }
  emailError.value = '';
  return true;
}

const validateOffer = () => {
  if (offer.value.length === 0) {
    offerError.value = 'Please select at least one service';
    return false;
  }
  offerError.value = '';
  return true;
}

const validateDescription = () => {
  if (!description.value.trim()) {
    descriptionError.value = 'Project description is required';
    return false;
  }
  if (description.value.trim().length < 10) {
    descriptionError.value = 'Description must be at least 10 characters';
    return false;
  }
  descriptionError.value = '';
  return true;
}

const validateForm = () => {
  const isNameValid = validateName();
  const isEmailValid = validateEmail();
  const isOfferValid = validateOffer();
  const isDescriptionValid = validateDescription();

  return isNameValid && isEmailValid && isOfferValid && isDescriptionValid;
}

const handleSubmit = async (event: Event) => {
  event.preventDefault();

  // Validate form before submission
  if (!validateForm()) {
    return;
  }

  // Since backend is not available, use mailto as fallback
  const subject = encodeURIComponent('WEB - ' + name.value);
  const body = encodeURIComponent(
      `Name: ${name.value}\n` +
      `Email: ${email.value}\n` +
      `Phone: ${telephone.value || 'Not provided'}\n` +
      `Budget: ${budget.value || 'Not specified'}\n` +
      `Services: ${offer.value.join(', ')}\n` +
      `Description:\n${description.value}`
  );

  const mailtoUrl = `mailto:jaron@haerensvisuals.com?subject=${subject}&body=${body}`;

  try {
    window.location.href = mailtoUrl;

    // Show success message
    success.value = true;
    setTimeout(() => {
      success.value = false;
    }, 3000);

    // Reset form after successful submission
    name.value = '';
    email.value = '';
    telephone.value = '';
    budget.value = '';
    offer.value = [];
    description.value = '';

    // Clear any validation errors
    nameError.value = '';
    emailError.value = '';
    offerError.value = '';
    descriptionError.value = '';

  } catch (error) {
    error.value = true;
    setTimeout(() => {
      error.value = false;
    }, 3000);
  }
}

const handleOfferChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.checked) {
    offer.value.push(target.value);
  } else {
    offer.value = offer.value.filter(item => item !== target.value);
  }

  // Clear validation error when user selects an option
  if (offer.value.length > 0) {
    offerError.value = '';
  }
}

// Real-time validation on blur
const handleNameBlur = () => validateName();
const handleEmailBlur = () => validateEmail();
const handleDescriptionBlur = () => validateDescription();
</script>

<template>
  <section id="connect">
    <div class="container container-title">
      <h2 class="montserrat-s24 montserrat-s24-U500">get in touch</h2>
      <p>Ready to turn your vision into captivating visuals? Feel free to reach out — I'm here to transform your ideas into unforgettable moments.</p>
    </div>
    <div class="layout-container">
      <form class="container container-form" @submit.prevent="handleSubmit">
        <div class="form-group">
          <div class="input-container">
            <input
                class="montserrat-s16 montserrat-s16-n500 input"
                :class="{ 'input-error': nameError }"
                type="text"
                required
                placeholder="Full name*"
                v-model="name"
                @blur="handleNameBlur"
            >
          </div>
          <div class="input-container">
            <input
                class="montserrat-s16 montserrat-s16-n500 input"
                type="tel"
                placeholder="Your phone"
                v-model="telephone"
            >
          </div>
        </div>
        <div class="input-container">
          <input
              class="montserrat-s16 montserrat-s16-n500 input"
              :class="{ 'input-error': emailError }"
              type="email"
              required
              placeholder="Your email*"
              v-model="email"
              @blur="handleEmailBlur"
          >
        </div>
        <div class="input-container">
          <label class="montserrat-s16 montserrat-s16-n500">What are you interested in* <span v-if="offerError" class="error-message montserrat-s16 montserrat-s16-n400">{{ offerError }}</span><span v-else class="montserrat-s16 montserrat-s16-n400 sub-label">Multi-select</span></label>
          <div class="input-group">
            <label v-for="o in data.offers" :key="o" :for="o" class="label label-form">
              <input
                  :id="o"
                  :name="o"
                  type="checkbox"
                  :value="o"
                  @change="handleOfferChange"
              >{{ o }}
            </label>
          </div>
        </div>
        <div class="input-container">
          <label class="montserrat-s16 montserrat-s16-n500">Estimated budget <span class="montserrat-s16 montserrat-s16-n400 sub-label">Optional</span></label>
          <div class="input-group">
            <label v-for="b in data.priceRanges" :key="b" :for="b" class="label label-form">
              <input
                  :id="b"
                  name="budget"
                  type="radio"
                  :value="b"
                  v-model="budget"
              >{{ b }}
            </label>
          </div>
        </div>
        <div class="input-container">
          <textarea
              class="montserrat-s16 montserrat-s16-n500 input"
              :class="{ 'input-error': descriptionError }"
              required
              placeholder="Project description*"
              rows="5"
              v-model="description"
              @blur="handleDescriptionBlur"
          ></textarea>
        </div>
        <div class="input-container">
          <input type="submit" value="Submit request" class="montserrat-s16 montserrat-s16-n400"/>
        </div>
      </form>

      <div class="container container-info">
        <img :src="`./assets/${data.fileName}`" alt="Picture of Jaron Haerens">
        <div>
          <p>Feel free to drop me a line! Whether you have a specific project in mind or just want to say hello, I'm all ears.</p>
          <a href="sms:+32468183344">(+32) 468 18 33 44</a>
          <a href="mailto:jaron@haerensvisuals.com?subject=Website contact">jaron@haerensvisuals.com</a>
          <div class="socials-container">
            <a target="_blank" href="https://instagram.com/jaronhaerens/">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 3.5H9C5.96243 3.5 3.5 5.96243 3.5 9V15C3.5 18.0376 5.96243 20.5 9 20.5H15C18.0376 20.5 20.5 18.0376 20.5 15V9C20.5 5.96243 18.0376 3.5 15 3.5Z" stroke="#D4D9DD" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 15.606C13.9916 15.606 15.606 13.9915 15.606 12C15.606 10.0085 13.9916 8.394 12 8.394C10.0085 8.394 8.39401 10.0085 8.39401 12C8.39401 13.9915 10.0085 15.606 12 15.606Z" stroke="#D4D9DD" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M16.894 8.136C17.4629 8.136 17.924 7.67485 17.924 7.106C17.924 6.53715 17.4629 6.076 16.894 6.076C16.3252 6.076 15.864 6.53715 15.864 7.106C15.864 7.67485 16.3252 8.136 16.894 8.136Z" fill="#D4D9DD"/>
              </svg>
            </a>
            <a target="_blank" href="https://facebook.com/jaronhaerens/">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.478 21.125C11.4834 21.2921 12.5094 21.2927 13.515 21.127M10.478 21.125C8.31845 20.7645 6.35578 19.6497 4.94091 17.9788C3.52604 16.308 2.74971 14.1894 2.75 12C2.75036 10.2354 3.25548 8.50765 4.20575 7.02072C5.15602 5.5338 6.51179 4.34972 8.11307 3.60821C9.71435 2.86669 11.4943 2.59868 13.243 2.8358C14.9916 3.07292 16.6359 3.80528 17.9819 4.94646C19.3279 6.08763 20.3193 7.59001 20.8393 9.2763C21.3593 10.9626 21.3861 12.7624 20.9165 14.4634C20.4469 16.1645 19.5005 17.6956 18.1891 18.8763C16.8776 20.057 15.2558 20.838 13.515 21.127M10.478 21.125L10.477 16.12H8.58C8.42087 16.12 8.26826 16.0568 8.15574 15.9443C8.04321 15.8317 7.98 15.6791 7.98 15.52V13.682C7.98 13.5229 8.04321 13.3703 8.15574 13.2577C8.26826 13.1452 8.42087 13.082 8.58 13.082H10.477V9.95C10.477 9.15435 10.7931 8.39129 11.3557 7.82868C11.9183 7.26607 12.6814 6.95 13.477 6.95H15.287C15.5522 6.95 15.8066 7.05536 15.9941 7.24289C16.1816 7.43043 16.287 7.68478 16.287 7.95V8.99C16.287 9.25522 16.1816 9.50957 15.9941 9.69711C15.8066 9.88464 15.5522 9.99 15.287 9.99H14.515C14.2498 9.99 13.9954 10.0954 13.8079 10.2829C13.6204 10.4704 13.515 10.7248 13.515 10.99V13.082H15.812C15.8991 13.082 15.9851 13.1009 16.0642 13.1375C16.1432 13.1741 16.2133 13.2275 16.2696 13.2939C16.326 13.3603 16.3672 13.4382 16.3904 13.5222C16.4136 13.6061 16.4182 13.6941 16.404 13.78L16.154 15.284C16.1152 15.5175 15.9948 15.7297 15.8142 15.8827C15.6337 16.0358 15.4047 16.1199 15.168 16.12H13.515V21.127" stroke="#D4D9DD" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </a>
            <a target="_blank" href="https://www.tiktok.com/@jaronhaerens/">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.2 10.1C20.2 10.32 20.02 10.501 19.8 10.49C18.6246 10.4311 17.4766 10.1135 16.438 9.56C16.157 9.41 15.8 9.605 15.8 9.924V15.5C15.7999 16.6696 15.458 17.8137 14.8163 18.7916C14.1745 19.7695 13.261 20.5385 12.188 21.004C11.115 21.4695 9.92931 21.6112 8.77681 21.4118C7.62431 21.2123 6.55524 20.6803 5.70108 19.8813C4.84693 19.0823 4.24494 18.051 3.96916 16.9144C3.69338 15.7777 3.75583 14.5852 4.14884 13.4836C4.54184 12.382 5.24827 11.4192 6.18122 10.7138C7.11417 10.0083 8.23296 9.59098 9.39999 9.513C9.45214 9.51024 9.50431 9.51826 9.55322 9.53656C9.60214 9.55486 9.64675 9.58305 9.68429 9.61937C9.72182 9.65568 9.75147 9.69934 9.77138 9.74763C9.79128 9.79591 9.80102 9.84778 9.79999 9.9V12.7C9.79999 12.92 9.61999 13.097 9.40199 13.133C8.95067 13.2089 8.53047 13.4122 8.19091 13.7191C7.85135 14.0259 7.6066 14.4234 7.48552 14.8648C7.36443 15.3061 7.37206 15.7729 7.50749 16.21C7.64293 16.6472 7.90053 17.0365 8.24993 17.3321C8.59933 17.6276 9.02596 17.8172 9.47951 17.8783C9.93306 17.9394 10.3946 17.8695 10.8098 17.677C11.225 17.4844 11.5764 17.1772 11.8227 17.7915C12.0691 16.4057 12.1999 15.9577 12.2 15.5V2.9C12.2 2.79391 12.2421 2.69217 12.3171 2.61716C12.3922 2.54214 12.4939 2.5 12.6 2.5H15.4C15.5069 2.50273 15.609 2.54522 15.6863 2.61919C15.7636 2.69315 15.8106 2.79328 15.818 2.9C15.9115 3.92472 16.3612 4.88426 17.0889 5.61177C17.8166 6.33928 18.7762 6.78874 19.801 6.882C20.021 6.902 20.201 7.079 20.201 7.3L20.2 10.1Z" stroke="#D4D9DD" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
  <Teleport to="body">
    <div class="toast-container">
      <transition name="toast">
        <div v-if="success" class="toast-success">
          <p>Email client opened! Please send the email to complete your request.</p>
        </div>
      </transition>
      <transition name="toast">
        <div v-if="error" class="toast-error">
          <p class="montserrat-s16-U700">Oops! Something went wrong, try again later.</p>
        </div>
      </transition>
    </div>
  </Teleport>
</template>

<style scoped lang="scss">
section#connect {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 4rem;

  .layout-container {
    display: flex;
    flex-direction: column;
    gap: 4rem;
    width: 100%;

    .container {
      width: 100%;
    }
  }

  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    &-title {
      align-items: flex-start;
      max-width: 31rem;
      text-align: left;
      gap: 2rem;
    }

    &-info {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4rem;

      img {
        display: none;
      }

      div {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        align-self: flex-end;
        justify-content: center;
        gap: .5rem;

        p {
          max-width: 24rem;
          text-align: right;
        }

        a {
          text-decoration: none;
        }

        .socials-container {
          display: flex;
          flex-direction: row;
          gap: 1rem;
        }
      }
    }

    &-form {
      gap: 2rem;

      .form-group {
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2rem;
        width: 100%;

        .input-container {
          padding: 0;
          position: relative;

          &:not(:has(input:required)):has(input:placeholder-shown) {
            &::before {
              content: "Optional";
              position: absolute;
              top: 50%;
              transform: translateY(-50%);
              left: 7.25rem;
              color: var(--gray-500);
              text-transform: none;
              font-weight: 400;
            }
          }
        }
      }

      .input-container {
        display: flex;
        flex-direction: column;
        gap: .8rem;
        box-sizing: border-box;
        width: 100%;

        >label {
          color: var(--gray-500);

          .sub-label {
            color: var(--gray-500);
          }
        }

        .input {
          box-sizing: border-box;
          width: 100%;

          &.input-error {
            border: 2px solid #ef4444;
            background-color: rgba(239, 68, 68, 0.1);
          }
        }

        .error-message {
          display: inline-block;
          color: #ef4444;
          margin-top: 0.25rem;
        }

        &:has(input:checked) {
          >label {
            color: var(--white);
          }
        }

        .input-group {
          box-sizing: border-box;
          display: flex;
          flex-wrap: wrap;
          flex-direction: row;
          align-items: center;
          gap: .5rem;
          width: fit-content;

          label {
            user-select: none;
            width: max-content;
          }
        }
      }
    }
  }
}

.toast{
  &-container {
    position: fixed;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    top: 0;
    left: 0;
    height: 100vh;
    width: 100vw;
    padding-top: 2rem;
    pointer-events: none;
    overflow: hidden;
    z-index: 99;
  }

  &-success, &-error {
    width: fit-content;
    max-width: calc(100vw - 1.6rem);
    box-sizing: border-box;
    padding: 1rem 2rem;
    border-radius: .5rem;
  }

  &-success {
    background-color: var(--white);

    p {
      color: var(--black);
    }
  }

  &-error {
    background-color: crimson;

    p {
      color: var(--white);
    }
  }
}

@media screen and (width >= 55rem) {
  section#connect {
    align-items: center;

    .layout-container {
      flex-direction: row-reverse;
      gap: 0;

      .container {
        width: 50%;
      }
    }

    .container {
      &-title {
        align-items: center;
        text-align: center;
      }

      &-info {
        img {
          display: block;
          max-height: 17rem;
          border-radius: .5rem;
        }

        div {
          align-items: center;
          align-self: unset;

          p {
            text-align: center;
          }
        }
      }

      &-form {
        .form-group {
          flex-direction: row;
          gap: 1rem;
        }
      }
    }
  }
}

.toast-enter-active, .toast-leave-active {
  transition: all 0.5s ease-in-out;
}
.toast-enter-from {
  transform: translateY(-6rem);
}
.toast-leave-to {
  transform: translateY(-6rem);
}
</style>