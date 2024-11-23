<x-mail::plain.notification>
<x-slot:body>
<% if (!content) { %><!-- Required content -->
<% } else { %><%- content %><% } %>
</x-slot:body>
</x-mail::plain.notification>
