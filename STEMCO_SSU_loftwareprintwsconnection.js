/**
 * @NApiVersion 2.0
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 * @Developer  Ivan M. Posadas Herrera
 * @Email  ivanmposadas@gmail.com
 * @NApiVersion 2.0
 * @Version alpha
 */
define(['N/ui/serverWidget','./STEMCO_SSP_loftwarewsdlimplementation'],

function(ui,wsdl) {

    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     * @Since 2015.2
     */

    function onRequest(context) {

      var form = ui.createForm({
         title: 'Demo Suitelet Print Loftware Form'
      });
      var subject = form.addField({
         id: 'subject',
         type: ui.FieldType.TEXT,
         label: 'Subject'
      });
      subject.layoutType = ui.FieldLayoutType.NORMAL;
      subject.breakType = ui.FieldBreakType.STARTCOL;
      subject.isMandatory = false;
      var recipient = form.addField({
         id: 'recipient',
         type: ui.FieldType.EMAIL,
         label: 'Recipient email'
      });
      recipient.isMandatory = false;
      var message = form.addField({
         id: 'message',
         type: ui.FieldType.TEXTAREA,
         label: 'Message'
      });
      message.displaySize = {
         width: 60,
         height: 10
      };

      form.addSubmitButton({
         label: 'Send Email'
      });

      if (context.request.method === 'POST') {
           var request = context.request;
           var parameters = [];
           parameters['QTY'] = 1234;
           parameters['SAP_NUM'] = 20589658;

		   //message.defaultValue = wsdl.getLabelList('','').substring(-1,3000);
           var obj = wsdl.getLabelList('','');
           message.defaultValue = JSON.stringify(obj[0]);

      }
      context.response.writePage(form);

    }
    return {
        onRequest: onRequest
    };

});
